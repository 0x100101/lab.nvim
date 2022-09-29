/*

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

*/

import type { DebuggerMessageHandler } from '@/runners/node/types.js';

export const consoleTraceHandler: DebuggerMessageHandler = (message) => {
	
	const frame = message.params.stackTrace.callFrames.find(frame => frame.url === `file://${message.__file}`);
	if (!frame) return null;
	
	const preview = message.params.stackTrace.callFrames.reduce((preview, frame) => {
		if (!frame.url.startsWith('node:')) {
			const fn = frame.functionName || '<anonymous>';
			return `${preview}${fn}  `;
		}
		return preview;
	}, '').slice(0, -3);

	return {
		event: 'log',
		type: message.params.type,
		line: frame.lineNumber,
		col: frame.columnNumber,
		text: preview,
	};
};