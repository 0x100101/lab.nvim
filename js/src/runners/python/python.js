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

import { spawn } from 'node:child_process';
import injectionRunner from '@/runners/base/injection-runner.js';
import injection, { injectionOffset } from '@/runners/python/injection.js';

const dynamicReplace = (str, substr, newSubstr = null) => {
	const regex = new RegExp(`${substr}`, 'g');
	return str.replaceAll(regex, newSubstr || '');
};

const adjustLineNumbers = (str) => {
	const LINENUM_REGEX = /line ([0-9]+)/g;
	const matches = str.matchAll(LINENUM_REGEX);
	if (!matches) return str;
	for (const match of matches) {
		str = str.replace(match[0], parseInt(match[1], 10) - injectionOffset);
	}
	return str;
};

const runner = {

	name: 'lab.pdb',
	embed: injection,
	errorBuffer: [],
	errorIngestionCount: 0,

	spawner(file) {
		return spawn('python3', ['-u', file]);
	},

	stdout(data) {
		const lines = data.split(/^==labnvim==/gm);
		lines.forEach(line => {
			line = line.replaceAll(/\n|\r/g, '');
			line = line.replaceAll(/\t/g, ' ');
			this.processMessage(line);
		});
	},

	stderr(data) {
		const lines = data.split(/\r?\n/).flatMap(line => {
			line = line.replaceAll(/\t|\s{2,}/g, '').trim();
			return line === '' ? [] : line;
		});

		this.errorBuffer = [...this.errorBuffer, ...lines];
		this.errorIngestionCount++;

		if (this.errorIngestionCount === 2) {
			this.processError(this.errorBuffer);
			this.errorIngestionCount = 0;
			this.errorBuffer = [];
		}
	},

	processError(lines) {

		const LINENUM_REGEX = /line ([0-9]+)/;
		const lineNumberMatch = lines[1].match(LINENUM_REGEX);
		const lineNumber = lineNumberMatch ? lineNumberMatch[1] - injectionOffset : 0;

		this.emitter.emit('notification', {
			event: 'error',
			line: lineNumber,
			col: null,
			text: lines[lines.length - 1],
			description: '',
		});
	},

	processMessage(message) {
		this.log(message);

		// Breakpoint
		if (message.startsWith('>')) {
			const LINENUM_REGEX = /\(([0-9]+)\)/;
			const lineNumberMatch = message.match(LINENUM_REGEX);
			const lineNumber = lineNumberMatch ? lineNumberMatch[1] - injectionOffset : 0;

			this.emitter.emit('notification', {
				event: 'paused',
				line: lineNumber,
				col: null,
				text: 'Paused',
			});
			return;
		}

		// Print
		const TOKEN_REGEX = /^<(\S*)>/;
		const tokenMatch = message.match(TOKEN_REGEX);

		if (tokenMatch) {
			const [type, lineNumber] = tokenMatch[1].split(':');

			if (type === 'print') {
				let text = message.replace(TOKEN_REGEX, '').trim();
				text = text.replaceAll(/\n|\t|\r/g, ' ');
				text = text.replaceAll(/\s{2,}/g, ' ');
				text = dynamicReplace(text, this.paths.tmpFilePath, this.paths.fileName);
				text = adjustLineNumbers(text);

				this.emitter.emit('notification', {
					event: 'log',
					type: null,
					line: parseInt(lineNumber),
					col: null,
					text: text,
				});
			}
		}
	},

};

export const codeRunner = Object.assign(Object.create(injectionRunner), runner);
