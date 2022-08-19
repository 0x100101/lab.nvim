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

import { createInterface } from 'readline';
import { stdin, stdout } from 'process';
import jsonrpc from 'jsonrpc-lite';
import { logger } from '@/util/logging.js';
import { print } from '@/util/index.js';
import { GenericCallback } from '@/types.js';

const input = createInterface({ input: stdin, output: stdout });
const log = logger('router');

const callbacks = new Map([
	[jsonrpc.RpcStatusType.request, new Map()],
	[jsonrpc.RpcStatusType.notification, new Map()]
]);

const handler = (type: jsonrpc.RpcStatusType) => {
	return (method: string, callback: GenericCallback) => {
		callbacks.get(type)?.set(method, callback);
	};
};

export const rpcRouter = {
	[jsonrpc.RpcStatusType.request]: handler(jsonrpc.RpcStatusType.request),
	[jsonrpc.RpcStatusType.notification]: handler(jsonrpc.RpcStatusType.notification),
};

const emitError = (message: string) => {
	print(jsonrpc.error(0, new jsonrpc.JsonRpcError(message, 100)));
	log(message);
};

const parseMessage = (data: string) => {
	try {
		const message = jsonrpc.parse(data);
		log(message);

		if (Array.isArray(message)) {
			emitError('Batched messages not supported.');
			return;
		}
		if (
			message.type !== jsonrpc.RpcStatusType.request &&
			message.type !== jsonrpc.RpcStatusType.notification
		) {
			emitError(`Message of type: "${message.type}" not supported.`);
			return;
		}
		const handlers = callbacks.get(message.type);

		if(!handlers || handlers.size === 0) {
			emitError(`No handlers registered for message of type: "${message.type}".`);
			return;
		}

		const handler = handlers.get(message.payload.method);

		if (!handler) {
			emitError(`No handler registered for method: "${message.payload.method}" of type: "${message.type}".`);
			return;
		}

		handler(message);
	}
	catch (e) {
		const error = e as Error;
		emitError(error.message);
	}
};

input.on('line', parseMessage);
