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
import injectionRunner from '../../runners/base/injection-runner.js';
import injection, { injectionOffset } from '../../runners/lua/injection.js';
const dynamicReplace = (str, substr, newSubstr = null) => {
    const regex = new RegExp(`${substr}`, 'g');
    return str.replaceAll(regex, newSubstr || '');
};
const stripFileName = (str, tmpFileName, fileName) => {
    return dynamicReplace(str, `\\.\\.\\.\\S+${tmpFileName}`, fileName);
};
const stripLineNumbers = (str) => {
    return str.replaceAll(/:[0-9]+:/g, '');
};
const runner = {
    name: 'lab.lua',
    embed: injection,
    spawner(file) {
        return spawn('lua', [file]);
    },
    stdout(data) {
        const lines = data.split(/^==labnvim==/gm);
        lines.forEach(line => {
            line = line.replaceAll(/\n|\r/g, '');
            line = line.replaceAll(/\t/g, ' ');
            line = stripFileName(line, this.paths.tmpFileName, this.paths.fileName);
            this.processMessage(line);
        });
    },
    stderr(data) {
        const message = stripFileName(data, this.paths.tmpFileName);
        this.processMessage(message);
    },
    processMessage(message) {
        this.log(message);
        // Error:
        if (message.startsWith('lua:')) {
            const lines = message.split(/\r?\n/);
            const LINENUM_REGEX = /:([0-9]+):/;
            const lineNumberMatch = message.match(LINENUM_REGEX);
            const lineNumber = lineNumberMatch ? lineNumberMatch[1] - injectionOffset : 0;
            let text = stripLineNumbers(lines[0]);
            text = text.replace('lua:', '');
            this.emitter.emit('notification', {
                event: 'error',
                line: lineNumber,
                col: null,
                text: text.trim(),
                description: '',
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
                text = stripLineNumbers(text);
                const logType = text.startsWith('stack traceback:') ? 'info' : null;
                this.emitter.emit('notification', {
                    event: 'log',
                    type: logType,
                    line: parseInt(lineNumber, 10),
                    col: null,
                    text: text.trim(),
                });
            }
        }
    },
};
export const codeRunner = Object.assign(Object.create(injectionRunner), runner);
