--[[

lab.nvim
Copyright: (c) 2022, Dan Peterson <hi@dan-peterson.ca>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

--]]

local Job = require 'plenary.job'
local Util = require 'lab.util'

local Process = {
	running = false,
	instance = nil,
	handlers = {},
}

local function script_path()
	local src = debug.getinfo(2, "S").source:sub(2)
	return src:match("(.*/)")
end

function Process:register(handler)
	table.insert(self.handlers, handler)
	return function()
		table.remove(self.handlers, Util.tablefind(self.handlers, handler))
	end
end

function Process:start()
	if self.running then return end
	self.instance = Job:new({
		command = 'node',
		args = { script_path() .. '../../js/dist/index.js' },

		on_stdout = function (error, data)
			local success, msg = pcall(function()
				return vim.json.decode(data)
			end)

			if not success then return end

			if msg.error then
				vim.notify(msg.error.message, "error", { title = "Lab.nvim"});
				return
			end

			for key, handler in pairs(self.handlers) do
				handler(msg)
			end
		end,

		on_stderr = function (error, data)
			print("stderr", vim.inspect(error), vim.inspect(data))
		end,
	})
	self.instance:start()
	self.running = true
end

function Process:send(data)
	if not Process.running then return end
	local success, payload = pcall(function()
		return vim.json.encode(data)
	end)
	if not success then return end
	Process.instance:send(payload .. "\n")
end

function Process:stop()
	if(Process.running) then
		vim.schedule_wrap(function()
			vim.loop.kill(self.instance.pid, 3)
			self.running = false
			self.instance = nil
		end)
	end
end

return Process
