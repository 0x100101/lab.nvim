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
import { EventEmitter } from 'events';
import { consoleHandler, consoleTraceHandler, pauseHandler, errorHandler } from '../../runners/node/message-evaluators/index.js';
import { establishConnection } from '../../runners/node/web-socket.js';
import { startDebugger } from '../../runners/node/server.js';
import { loadSourceMappings } from '../../runners/node/source-map.js';
import { logger } from '../../util/logging.js';
const log = logger('coderunner.node');
export const init = async ({ file = '', useSourceMap = false, ip = '127.0.0.1', port = '8086' }) => {
    log('Initializing node code-runner on: ', file);
    const codeRunner = new EventEmitter();
    const lineMappings = (useSourceMap) ? await loadSourceMappings(file) : [];
    const debugServer = await startDebugger(file, ip, port);
    const nodeDebugger = await establishConnection(debugServer.url);
    codeRunner.on('stop', debugServer.stop);
    codeRunner.on('resume', nodeDebugger.command.resume);
    nodeDebugger.connection.on('message', (data) => {
        const message = JSON.parse(data.toString());
        message.__file = file;
        for (const shouldFilter of filters) {
            if (shouldFilter(message)) {
                return;
            }
        }
        for (const responder of autoResponders) {
            const [condition, response] = responder;
            if (condition(message)) {
                response(nodeDebugger);
                return;
            }
        }
        const notification = evaluateMessage(message);
        if (!notification) {
            return;
        }
        if (useSourceMap) {
            notification.line = lineMappings[notification.line]?.[0]?.[2] ?? 0;
        }
        codeRunner.emit('notification', notification);
    });
    nodeDebugger.command.initialize();
    return codeRunner;
};
const autoResponders = [
    [
        (message) => message.method === 'Debugger.paused' && message.params.reason === 'Break on start',
        (nodeDebugger) => nodeDebugger.command.resume(),
    ]
];
const filters = [
    (message) => {
        const frame = message.params?.stackTrace?.callFrames?.[0]?.url;
        if (frame && frame !== `file://${message.__file}`)
            return true;
    }
];
const evaluateMessage = (message) => {
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'trace') {
        return consoleTraceHandler(message);
    }
    if (message.method === 'Runtime.consoleAPICalled') {
        return consoleHandler(message);
    }
    if (message.method === 'Debugger.paused') {
        return pauseHandler(message);
    }
    if (message.method === 'Runtime.exceptionThrown') {
        return errorHandler(message);
    }
};
