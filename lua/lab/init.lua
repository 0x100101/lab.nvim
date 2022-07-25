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
local CodeRunner = require 'lab.code_runner'
local QuickData = require 'lab.quick_data'

local Lab = {}
local state = { active = false }

local default_opts = {
	code_runner = {
		enabled = true,
	},
	quick_data = {
		enabled = true,
	},
}

function Lab.setup(opts)
	if state.active == true then return end

	opts = vim.tbl_deep_extend('force', default_opts, opts)

	if opts.code_runner.enabled or opts.quick_data.enabled then
		Process:start()
	end

	if opts.code_runner.enabled then
		CodeRunner.setup(opts);
	end

	if opts.quick_data.enabled then
		QuickData.setup(opts)
	end

	state.active = true;
end

function Lab.reset()
	Process:stop()
	Process:start()
end

function Lab.stop()
	Process:stop()
end

return Lab
