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
import { print } from '@/util/index.js';
import { rpcRouter as rpc } from '@/rpc-router.js';
import { runner } from '@/runner.js';
import { refresh as quickDataRefresh, dataFilePath as quickDataPath, generate as quickDataGenerate } from '@/quick-data/quick-data.js';
import type { CodeRunnerMessage, ConfigMessage, QuickDataMessage} from '@/types.js';
import { CodeRunnerMethod, ConfigMethod, QuickDataMethod } from '@/constants.js';

enum LANG {
	STATUS_OK = 'ok',
}

rpc.request(CodeRunnerMethod.Start, async (message: CodeRunnerMessage) => {
	const [started, errMessage] = await runner.start(message.payload.params);
	if (!started) {
		print(jsonrpc.error(message.payload.id, new jsonrpc.JsonRpcError(errMessage, 101)));
	} else {
		print(jsonrpc.success(message.payload.id, LANG.STATUS_OK));
	}
});

rpc.request(CodeRunnerMethod.Stop, (message: CodeRunnerMessage) => {
	const [stopped, errMessage] = runner.stop(message.payload.params);
	if (!stopped) {
		print(jsonrpc.error(message.payload.id, new jsonrpc.JsonRpcError(errMessage, 102)));
	} else {
		print(jsonrpc.success(message.payload.id, LANG.STATUS_OK));
	}
});

rpc.request(CodeRunnerMethod.Resume, (message: CodeRunnerMessage) => {
	const [resumed, errMessage] = runner.resume(message.payload.params);
	if (!resumed) {
		print(jsonrpc.error(message.payload.id, new jsonrpc.JsonRpcError(errMessage, 103)));
	} else {
		print(jsonrpc.success(message.payload.id, LANG.STATUS_OK));
	}
});

rpc.request(ConfigMethod.Get, async (message: ConfigMessage) => {
	if (message.payload.params.key === 'quick.data.source') {
		await quickDataGenerate();
		print(jsonrpc.success(message.payload.id, { path: quickDataPath }));
	} else {
		print(jsonrpc.error(message.payload.id, new jsonrpc.JsonRpcError('Unrecognized key', 104)));
	}
});

rpc.request(QuickDataMethod.Update, (message: QuickDataMessage) => {
	const text = quickDataRefresh(message.payload.params.mod, message.payload.params.method) || '';
	print(jsonrpc.success(message.payload.id, { text }));
});
