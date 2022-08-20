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
import { logger } from './util/logging.js';
import { print } from './util/index.js';
const input = createInterface({ input: stdin, output: stdout });
const log = logger('router');
const callbacks = new Map([
    ["request" /* jsonrpc.RpcStatusType.request */, new Map()],
    ["notification" /* jsonrpc.RpcStatusType.notification */, new Map()]
]);
const handler = (type) => {
    return (method, callback) => {
        callbacks.get(type)?.set(method, callback);
    };
};
export const rpcRouter = {
    ["request" /* jsonrpc.RpcStatusType.request */]: handler("request" /* jsonrpc.RpcStatusType.request */),
    ["notification" /* jsonrpc.RpcStatusType.notification */]: handler("notification" /* jsonrpc.RpcStatusType.notification */),
};
const emitError = (message) => {
    print(jsonrpc.error(0, new jsonrpc.JsonRpcError(message, 100)));
    log(message);
};
const parseMessage = (data) => {
    try {
        const message = jsonrpc.parse(data);
        log(message);
        if (Array.isArray(message)) {
            emitError('Batched messages not supported.');
            return;
        }
        if (message.type !== "request" /* jsonrpc.RpcStatusType.request */ &&
            message.type !== "notification" /* jsonrpc.RpcStatusType.notification */) {
            emitError(`Message of type: "${message.type}" not supported.`);
            return;
        }
        const handlers = callbacks.get(message.type);
        if (!handlers || handlers.size === 0) {
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
        const error = e;
        emitError(error.message);
    }
};
input.on('line', parseMessage);
