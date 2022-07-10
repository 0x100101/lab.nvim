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
import util from 'node:util';
import process from 'node:process';
import EventEmitter from 'node:events';
import { WebSocket } from 'ws';
import { DEBUG, WS_REGEX } from '../constants.js'
import { logger } from '../logging.js';
import { rpcid } from '../util.js';

const log = logger('coderunner.node');

const runner = {
	async init({ file, ip, port }) {
		const emitter = new EventEmitter();

		const server = await this.initServer(file, ip, port);
		const ws = await this.initConnection(server.url);

		emitter.on('stop', () => {
			server.stop();
		});

		emitter.on('resume', () => {
			ws.send({ id: rpcid(), method: 'Debugger.resume', params: { terminateOnResume: false } });
		});

		ws.on('message', data => {
			const message = JSON.parse(data.toString());

			const filtered = this.filterMessage(file, ws, message);
			if (filtered) return;

			const response = this.processMessage(file, message)
			if (response) emitter.emit('notification', response);
		});

		ws.send({ id: rpcid(), method: 'Runtime.enable' });
		ws.send({ id: rpcid(), method: 'Debugger.enable' });
		ws.send({ id: rpcid(), method: 'Runtime.runIfWaitingForDebugger' });

		return emitter;
	},
	
	findFrame(file, callFrames) {
		return callFrames.find(frame => frame.url === `file://${file}`);
	},

	filterMessage(file, ws, message) {
		const frame = message.params?.stackTrace?.callFrames?.[0]?.url;
		if (frame && frame !== `file://${file}`) {
			return true;
		}
		
		if (message.method === 'Debugger.paused') {
			if (message.params.reason === 'Break on start') {
				ws.send({ id: rpcid(), method: 'Debugger.resume', params: { terminateOnResume: false } });
				return true;
			}
		}
		return false;
	},

	processMessage(file, message) {
		if (DEBUG && message.method !== 'Debugger.scriptParsed') log.info(util.inspect(message, false, null));

		if (message.method === 'Debugger.paused') {
			const frame = this.findFrame(file, message.params.exceptionDetails.stackTrace.callFrames);
			if (!frame) return;
			
			return {
				event: 'paused',
				line: frame.location.lineNumber,
				col: frame.location.columnNumber,
				text: 'Paused',
			}
		}
		
		if (message.method === 'Runtime.exceptionThrown') {
			// Int the case of an error, if we can't find a frame originating in the active file, for clarity we'll still show it on line one.
			let frame = this.findFrame(file, message.params.exceptionDetails.stackTrace.callFrames);
			if (!frame) frame = { lineNumber: 0, columnNumber: 0 };
			
			const description = message.params.exceptionDetails.exception.preview.properties.find(items => items.name === 'message');
			
			return {
				event: 'error',
				line: frame.lineNumber,
				col: frame.columnNumber,
				text: description.value,
				description: message.params.exceptionDetails.exception.description.replaceAll(/\n/g, ''),
			};
		}

		if (message.method === 'Runtime.consoleAPICalled') {
			
			const frame = this.findFrame(file, message.params.stackTrace.callFrames);
			if (!frame) return;

			let preview = ``;

			message.params.args.forEach((arg, index, arr) => {
				switch (arg.type) {
					case 'string':
						preview += `"${arg.value}"`;
						break;
					case 'function':
						preview += `${arg.description})`;
						break;
					case 'symbol':
						preview += `${arg.description})`;
						break;
					case 'object':
						if (arg.subtype === 'array') {
							preview += `[`;
							arg.preview.properties.forEach((prop, index, arr) => {
								const value = (prop.type === 'function') ? '' : (prop.type === 'string') ? `"${prop.value}"` : prop.value;
								preview += ` ${value}`;
								if (index !== (arr.length - 1)) preview += `,`;
							});
							preview += ` ]`;
						} else {
							preview += `{`;
							arg.preview.properties.forEach((prop, index, arr) => {
								const value = (prop.type === 'function') ? '' : (prop.type === 'string') ? `"${prop.value}"` : prop.value;
								preview += ` ${prop.name}: ${value}`;
								if (index !== (arr.length - 1)) preview += `,`;
							});
							preview += ` }`;
						}
						break;
					default:
						preview += `${arg.value}`;
						break;
				}
				if (index !== (arr.length - 1)) preview += `, `
			});
			
			preview = preview.replaceAll(/\n|\t|\r/g, ' ');
			preview = preview.replaceAll(/\s{2,}/g, ' ');
			
			if (message.params.type === 'trace') {
				if (preview === '"console.trace"') preview = '';
				if (preview !== '') preview += ' ';
				message.params.stackTrace.callFrames.forEach((frame) => {
					if (!frame.url.startsWith('node:')) {
						const fn = frame.functionName || '<anonymous>';
						preview += `${fn}  `;
					}
				});
				preview = preview.slice(0, -3);
			}
	
			return {
				event: 'log',
				type: message.params.type,
				line: frame.lineNumber,
				col: frame.columnNumber,
				text: preview,
			};
		}
	},

	async initServer(file, ip, port) {
		return new Promise((resolve, reject) => {
			const spawned = {};

			spawned.server = spawn('node', [`--inspect-brk=${ip}:${port}`, file]);

			spawned.stop = () => {
				spawned.server.kill('SIGHUP');
			};

			spawned.processData = (data) => {
				spawned.url = data.toString().match(WS_REGEX);
				if (DEBUG) log.info(spawned.url)
				if (spawned.url) {
					resolve(spawned);
				} else {
					reject('no url emitted by server');
				}
			}

			spawned.server.stdout.once('data', spawned.processData);
			spawned.server.stderr.once('data', spawned.processData);
			spawned.server.on('error', reject);

			process.on('uncaughtExceptionMonitor', spawned.stop);
		});
	},

	async initConnection(url) {
		return new Promise(async (resolve, reject) => {
			try {
				const ws = new WebSocket(url);
				const send = ws.send;
				ws.send = function(payload) {
					send.apply(this, [JSON.stringify(payload)]);
				}
				ws.on('open', () => {
					resolve(ws);
				})
			} catch (err) {
				reject(err)
			}
		});
	}
};

export const CodeRunner = function({ file, ip = '127.0.0.1', port = '8086' }) {
	const instance = Object.create(runner);
	return instance.init({ file, ip, port });
}
