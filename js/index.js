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

import readline from 'node:readline';
import { stdin, stdout } from 'node:process';
import jsonrpc from 'jsonrpc-lite';
import { logger } from './util/logging.js';
import { print } from './util/index.js';
import { RPC_TYPE, RPC_METHOD } from './constants.js'
import { runner } from './runner.js';

const log = logger();
const input = readline.createInterface({ input: stdin, output: stdout });

while (true) {
	const data = await new Promise(async (resolve) => {
		input.question('', (remoteInput) => resolve(remoteInput));
	});
	try {
		const message = jsonrpc.parse(data)
		log(message);
		({
			[RPC_TYPE.REQUEST]: {
				[RPC_METHOD.RUNNER_START]: async () => {
					const [started, startedMsg] = await runner.start(message.payload.params);
					if (!started) {
						print(jsonrpc.error(message.payload.id, new jsonrpc.JsonRpcError(`Runner not started: ${startedMsg}`, 101)));
						return;
					}
					print(jsonrpc.success(message.payload.id, 'ok'));
				},
				[RPC_METHOD.RUNNER_STOP]: () => {
					const [stopped, stopMsg] = runner.stop(message.payload.params);
					if (!stopped) {
						print(jsonrpc.error(message.payload.id, new jsonrpc.JsonRpcError(`Runner not stopped ${stopMsg}`, 102)));
						return;
					}
					print(jsonrpc.success(message.payload.id, 'ok'));
				},
				[RPC_METHOD.RUNNER_RESUME]: () => {
					const [resumed, resumeMsg] = runner.resume(message.payload.params);
					if (!resumed) {
						print(jsonrpc.error(message.payload.id, new jsonrpc.JsonRpcError(`Runner not resumed ${resumeMsg}`, 102)));
						return;
					}
					print(jsonrpc.success(message.payload.id, 'ok'));
				},
			},
		}[message.type][message.payload.method]());
	} catch (err) {
		log(err);
		print(jsonrpc.error(0, new jsonrpc.JsonRpcError(`routing error occured ${err}`, 100)));
		continue;
	}
}
