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
import { WebSocket } from 'ws';
import { rpcid } from '../../util/index.js';
const wsConnect = async (url) => {
    return new Promise((resolve, reject) => {
        try {
            const ws = new WebSocket(url);
            ws.on('open', () => {
                process.on('uncaughtExceptionMonitor', ws.close);
                resolve(ws);
            });
        }
        catch (err) {
            reject(err);
        }
    });
};
export const establishConnection = async (url) => {
    const connection = await wsConnect(url);
    return {
        connection,
        command: {
            resume: () => {
                connection.send(JSON.stringify({ id: rpcid(), method: 'Debugger.resume', params: { terminateOnResume: false } }));
            },
            initialize: () => {
                connection.send(JSON.stringify({ id: rpcid(), method: 'Runtime.enable' }));
                connection.send(JSON.stringify({ id: rpcid(), method: 'Debugger.enable' }));
                connection.send(JSON.stringify({ id: rpcid(), method: 'Runtime.runIfWaitingForDebugger' }));
            }
        }
    };
};
