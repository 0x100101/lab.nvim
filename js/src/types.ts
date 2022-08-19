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

interface RPCMessage<T> extends jsonrpc.JsonRpc {
	payload: {
		id: string | number,
		params: T,
	}
}

export interface RunnerParams {
	file: string,
	config: string,
}

interface QuickDataParams {
	mod: string,
	method: string,
}

interface ConfigParams {
	key: string,
}

export type CodeRunnerMessage = RPCMessage<RunnerParams>;
export type QuickDataMessage = RPCMessage<QuickDataParams>;
export type ConfigMessage = RPCMessage<ConfigParams>;


type Preprocessors = 'lab.esbuild';
type Runners = 'lab.node' | 'lab.python' | 'lab.lua';

export interface CodeRunnerConfig {
	version: number,
	preprocessors: Array<Preprocessors>,
	runner: Runners,
}


export interface PreprocessingData {
	filePath: string,
	useSourceMap: boolean,
}

export interface CodeRunnerNotification {
	event: string,
	type?: string,
	line: number,
	col?: number,
	text: string,
	description?: string,
}

/* eslint-disable-next-line */
export type GenericCallback = (...args: any[]) => any;

