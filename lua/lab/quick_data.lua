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

local Process = require 'lab.process'
local QuickDataComp = require 'lab.quick_data_cmp'

local QuickData = {
	handlers = {},
}

Process:register(function(msg) 
	if not msg.method then
		if QuickData.handlers[msg.id] then
			QuickData.handlers[msg.id](msg.result)
			QuickData.handlers[msg.id] = nil
		end
	end;
end)

function QuickData.setup(opts)
	local has_cmp, cmp = pcall(require, 'cmp')
	if has_cmp then
		QuickData.init(cmp)
	else
		vim.notify("Quick data feature requires nvim cmp", "error", { title = "Lab.nvim"});
	end
end

function QuickData.init(cmp)
	local id = "quickdata.init"
	cmp.register_source('lab.quick_data', QuickDataComp.new())
	local initHandler = function(data)
		QuickDataComp.init(data.path, QuickData.update)
	end
	QuickData.handlers[id] = initHandler
	Process:send({
		jsonrpc = "2.0",
		id = id,
		method = "Lab.Config.Get",
		params = {
			key = "quick.data.source",
		}
	})
end

function QuickData.update(index, mod, method, updateFunc)
	local id = "quickdata.update." .. tostring(index)
	QuickData.handlers[id] = updateFunc
	Process:send({
		jsonrpc = "2.0",
		id = id,
		method = "Lab.QuickData.Update",
		params = {
			mod = mod,
			method = method,
		}
	})
end

return QuickData