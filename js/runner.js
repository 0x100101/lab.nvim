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

import jsonrpc from 'jsonrpc-lite';
import { logger } from './logging.js';
import { print } from './util.js';
import { DEBUG } from './constants.js'

const log = logger();

export const Runner = function() {
	return {
		instances: new Map(),
		start: async function(args) {
			if (this.instances.has(args.file)) return false;

			const { CodeRunner } = await import('./runners/node.js');
			const runner = await new CodeRunner({ file: args.file });

			this.instances.set(args.file, runner);

			runner.on('notification', (data) => {
				if (DEBUG) log.info(args.file, 'received data from runner:', data);
				const message = jsonrpc.notification('update', { file: args.file, ...data });
				print(message);
			});
			return true;
		},
		stop(args) {
			const runner = this.instances.get(args.file);
			if (!runner) return false;

			runner.emit('stop');
			this.instances.delete(args.file);
			return true;
		},
		resume(args) {
			const runner = this.instances.get(args.file);
			if (!runner) return false;
			
			runner.emit('resume');
			return true;
		},
	}
}
