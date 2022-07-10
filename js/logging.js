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

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import nodeLogger from 'simple-node-logger';
import { DEBUG } from './constants.js'

const __dirname = dirname(fileURLToPath(import.meta.url));

const loggers = [];

export const logger = (name = 'server') => {
	if (loggers[name]) return loggers[name];

	loggers[name] = nodeLogger.createSimpleFileLogger(`${__dirname}/logs/${name}.log`);
	
	if (DEBUG) {
		const cl = console.log;
		console.log = function(...args) {
			loggers[name].info(...args);
			cl.apply(this, args);
		}
	}

	return loggers[name];
}
