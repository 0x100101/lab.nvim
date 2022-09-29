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

import type { DebuggerProcess } from '@/runners/node/types.js';

import { spawn } from 'node:child_process';
import { logger } from '@/util/logging.js';

const WS_REGEX = /ws:\/\/\S*/ig;

const log = logger('coderunner.server');

export const startDebugger = async (file: string, ip: string, port: string): Promise<DebuggerProcess> => {
	return new Promise((resolve, reject) => {
		const spawned = {} as DebuggerProcess;

		spawned.server = spawn('node', [`--inspect-brk=${ip}:${port}`, file]);

		spawned.stop = () => {
			spawned.server.kill('SIGHUP');
		};

		spawned.processData = (data) => {
			const match = data.toString().match(WS_REGEX);
			if (match) {
				spawned.url = match[0];
				log('Debugger running at: ', spawned.url);
				resolve(spawned);
			} else {
				reject('no url emitted by server');
			}
		};

		spawned.server.stdout.once('data', spawned.processData);
		spawned.server.stderr.once('data', spawned.processData);
		spawned.server.on('error', reject);

		process.on('uncaughtExceptionMonitor', spawned.stop);
	});
};