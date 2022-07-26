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

local VirtualText = {
	namespace = api.nvim_create_namespace('proto'),
	lines = {},
}

function VirtualText:render(opts)

	if not opts.buf_handle then return end
	if not opts.line_num then return end
	if not opts.run_id then return end

	local default_opts = { icon = '', pos = 'eol', append = true, hl = 'DiagnosticVirtualTextHint' }

	for k, v in pairs(default_opts) do
		if opts[k] == nil then opts[k] = v end
	end

	local mark_opts = {
		end_line = 0,
		virt_text_pos = opts.pos,
	}

	local current = nil
	if (self.lines[tostring(opts.buf_handle)] and self.lines[tostring(opts.buf_handle)][tostring(opts.line_num)]) then
		current = self.lines[tostring(opts.buf_handle)][tostring(opts.line_num)]
	end

	-- Skip writing identical text to the same line when the existing text is from a previous run.
	if (current and (current.text == opts.text) and (current.run_id ~= opts.run_id)) then
		self.lines[tostring(opts.buf_handle)][tostring(opts.line_num)].run_id = opts.run_id
		return
	end

	-- This line currently has text and:
	if current then
		-- It's from the current run (append):
		if current.run_id == opts.run_id then
			if opts.append then
				opts.text = current.text .. " │ " .. opts.text
				mark_opts.id = current.markId
			end
		-- It's from a previous run (delete):
		else
			api.nvim_buf_del_extmark(opts.buf_handle, self.namespace, current.markId);
		end
	end

	mark_opts.virt_text = { { " " .. opts.icon .. " │ " .. opts.text .. " ", opts.hl } }

	local markId = api.nvim_buf_set_extmark(opts.buf_handle, self.namespace, opts.line_num, 0, mark_opts)

	if not self.lines[tostring(opts.buf_handle)] then
		self.lines[tostring(opts.buf_handle)] = {}
	end
	self.lines[tostring(opts.buf_handle)][tostring(opts.line_num)] = { markId = markId, run_id = opts.run_id, text = opts.text }

	return { mark_id = markId, line_num = opts.line_num }
end

function VirtualText:delete(buf_handle, mark_id, line_num)
	api.nvim_buf_del_extmark(buf_handle, self.namespace, mark_id)
	self.lines[tostring(buf_handle)][tostring(line_num)] = nil
end

function VirtualText:clear(buf_handle, run_id)
	if not self.lines[tostring(buf_handle)] then return end

	for key, line in pairs(self.lines[tostring(buf_handle)]) do
		if line.run_id ~= run_id then
			vim.defer_fn(function()
				api.nvim_buf_del_extmark(buf_handle, self.namespace, line.markId);
			end, 1)
			self.lines[tostring(buf_handle)][key] = nil
		end
	end
end

function VirtualText:clearAll(buf_handle)
	local cur_marks = api.nvim_buf_get_extmarks(0, self.namespace, 0, -1, {})
	for key, mark in pairs(cur_marks) do
		api.nvim_buf_del_extmark(buf_handle, self.namespace, mark[1])
	end
	self.lines[tostring(buf_handle)] = {}
end

return VirtualText
