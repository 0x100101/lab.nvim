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

export const errorHandler: DebuggerMessageHandler = (message) => {
	
	const frame = message.params.exceptionDetails.stackTrace.callFrames.find(frame => frame.url === `file://${message.__file}`);

	// In the case of an error: if we can't find a frame originating in the active file, for clarity we'll still show it on line one.
	const lineNumber = (frame) ? frame.lineNumber : 0;
	const columnNumber = (frame) ? frame.columnNumber : 0;

	const text = message.params.exceptionDetails.exception.preview.properties.find(items => items.name === 'message');
	const description = message.params.exceptionDetails.exception.description.replaceAll(/\n/g, '');

	return {
		event: 'error',
		text: text?.value || '',
		description: description || '',
		line: lineNumber,
		col: columnNumber,
	};
};