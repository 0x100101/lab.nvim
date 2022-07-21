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

local Filetype = require'plenary.filetype'
local Path = require'plenary.path'
local Configs = require'lab.code_runner_configs'

local Config = {};


function Config.init(file_path)
	
	local file_type = Filetype.detect(file_path)

	local config_path = Path:new(vim.fn.stdpath('data').."/lab/runnerconf")
	if not config_path:exists() then
		config_path:mkdir({ parents = true })
	end

	local config_file = Path:new(file_path:gsub(config_path._sep, "-"):sub(2):lower() .. ".json")
	local path = config_path:joinpath(config_file.filename)

	if not path:exists() then
		local configData
		
		if file_type == 'javascript' or file_type == 'typescript' or file_type == 'javascriptreact' or file_type == 'typescriptreact' then
			configData = Configs.js
		elseif file_type == 'python' then
			configData = Configs.py
		elseif file_type == 'lua' then
			configData = Configs.lua
		end
		
		if configData then
			path:write(configData, "w")
		end
	end
	
	return path;
end

function Config.read(file_path)
	local path = Config.init(file_path)
	return path:read()
end

function Config.edit(file_path)
	local path = Config.init(file_path)
	vim.cmd(":edit " .. path.filename)
end

return Config
