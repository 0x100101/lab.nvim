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
import { logger } from './util/logging.js';
import { print } from './util/index.js';
import { RPC_METHOD } from './constants.js';
import RpcRouter from './rpc-router.js';
import { runner } from './runner.js';
import { refresh as quickDataRefresh, dataFilePath as quickDataPath } from './quick_data/quick_data.js'

const log = logger('process');
const router = new RpcRouter();

router.request(RPC_METHOD.RUNNER_START, async (message) => {
	const [started, startedMsg] = await runner.start(message.payload.params);
	if (!started) {
		print(jsonrpc.error(message.payload.id, new jsonrpc.JsonRpcError(`Runner not started: ${startedMsg}`, 101)));
		return;
	}
	print(jsonrpc.success(message.payload.id, 'ok'));
});

router.request(RPC_METHOD.RUNNER_STOP, (message) => {
	const [stopped, stopMsg] = runner.stop(message.payload.params);
	if (!stopped) {
		print(jsonrpc.error(message.payload.id, new jsonrpc.JsonRpcError(`Runner not stopped ${stopMsg}`, 102)));
		return;
	}
	print(jsonrpc.success(message.payload.id, 'ok'));
});

router.request(RPC_METHOD.RUNNER_RESUME, (message) => {
	const [resumed, resumeMsg] = runner.resume(message.payload.params);
	if (!resumed) {
		print(jsonrpc.error(message.payload.id, new jsonrpc.JsonRpcError(`Runner not resumed ${resumeMsg}`, 103)));
		return;
	}
	print(jsonrpc.success(message.payload.id, 'ok'));
});

router.request(RPC_METHOD.CONFIG_GET, (message) => {
	if (message.payload.params.key === 'quick.data.source') {
		print(jsonrpc.success(message.payload.id, { path: quickDataPath }));
		return;
	}
	print(jsonrpc.error(message.payload.id, new jsonrpc.JsonRpcError(`Unrecognized key`, 104)));
});

router.request(RPC_METHOD.QUICKDATA_UPDATE, (message) => {
	const text = quickDataRefresh(message.payload.params.mod, message.payload.params.method) || '';
	print(jsonrpc.success(message.payload.id, { text }));
});
