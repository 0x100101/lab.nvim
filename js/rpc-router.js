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

import { RPC_TYPE, RPC_METHOD } from './constants.js'
import readline from 'node:readline';
import { stdin, stdout } from 'node:process';
import jsonrpc from 'jsonrpc-lite';
import { logger } from './util/logging.js';
import { print } from './util/index.js';

const input = readline.createInterface({ input: stdin, output: stdout });
const log = logger('router');

export default function() {

	this.callbacks = new Map([
		[RPC_TYPE.REQUEST, new Map()],
		[RPC_TYPE.NOTIFICATION, new Map()]
	]);

	this.handler = function(type) {
		return (method, callback) => {
			this.callbacks.get(type).set(method, callback);
		};
	}

	this[RPC_TYPE.REQUEST] = this.handler(RPC_TYPE.REQUEST);
	this[RPC_TYPE.NOTIFICATION] = this.handler(RPC_TYPE.NOTIFICATION);
	
	this.init = async function() {
		while (true) {
			const data = await new Promise(async (resolve) => {
				input.question('', remoteInput => resolve(remoteInput));
			});
			try {
				const message = jsonrpc.parse(data);
				log(message);
				
				const registeredHandler = this.callbacks.get(message.type).get(message.payload.method);
				
				if (!registeredHandler) {
					log("No handler registered for: ", message.type, message.payload.method)
					continue;
				}
				registeredHandler(message);
			}
			catch (err) {
				print(jsonrpc.error(0, new jsonrpc.JsonRpcError(err.message, 100)));
				log(err);
				continue;
			}
		}
	}

	this.init();
};
