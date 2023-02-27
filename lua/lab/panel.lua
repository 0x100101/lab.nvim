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

local api = vim.api

local Panel = {
	win_handle = nil,
	buf_handle = nil,
	is_open = false,
}

function Panel:init()
	self.buf_handle = api.nvim_create_buf(false, false)

	api.nvim_buf_set_name(self.buf_handle, "lab")

	api.nvim_buf_set_option(self.buf_handle, "buftype", "nofile")
	api.nvim_buf_set_option(self.buf_handle, "swapfile", false)
	api.nvim_buf_set_option(self.buf_handle, "buflisted", false)
	api.nvim_buf_set_option(self.buf_handle, "filetype", "markdown")
	api.nvim_buf_set_option(self.buf_handle, "modifiable", false)
	api.nvim_buf_set_option(self.buf_handle, "readonly", true)
end

function Panel:open()

	api.nvim_command('botright split lab')
	api.nvim_command('setlocal nonumber norelativenumber')
	api.nvim_win_set_height(0, 10)

	self.win_handle = api.nvim_tabpage_get_win(0)

	api.nvim_win_set_option(self.win_handle, "spell", false)
	api.nvim_win_set_option(self.win_handle, "winfixwidth", true)
	api.nvim_win_set_option(self.win_handle, "signcolumn", "no")

	self.is_open = true
	self:scrollToBottom()
end

function Panel:close()
	if self.is_open and api.nvim_win_is_valid(self.win_handle) then
		api.nvim_win_close(self.win_handle, false)
		self.is_open = false
	else
		Panel:open()
	end
end

function Panel:modifiable(state)
	api.nvim_buf_set_option(self.buf_handle, "modifiable", state)
	api.nvim_buf_set_option(self.buf_handle, "readonly", (not state))
end

function Panel:write(text)
	self:modifiable(true)
	local lines = {text}
	api.nvim_buf_set_lines(self.buf_handle, -1, -1, true, lines)
	self:modifiable(false)
	self:scrollToBottom()
end

function Panel:scrollToBottom()
	if self.is_open then
		if not api.nvim_win_is_valid(self.win_handle) then
			self.is_open = false
			return
		end
		local total_lines = api.nvim_buf_line_count(self.buf_handle)
		api.nvim_win_set_cursor(self.win_handle, { total_lines, 0 })
	end
end

return Panel
