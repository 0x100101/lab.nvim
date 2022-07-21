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
import { print, tryRun } from './util/index.js';
import { RUNNER_PATHS, PROCESSORS, PROCESSOR_PATHS } from './constants.js'

const log = logger('runner');

export const runner = {

	instances: new Map(),

	start: async function(args) {
		log(args)
		
		// Validate inputs:
		if (!('file' in args)) return [false, 'No file specified.'];
		if (!('config' in args)) return [false, 'No config provided.'];
		if (this.instances.has(args.file)) return [false, 'Already started on file.'];
		
		// Parse config:
		const [config, configError] = await tryRun(() => {
			return JSON.parse(args.config);
		});

		if (configError) return [false, configError.message]
		if (!('runner' in config)) return [false, 'No runner configured.'];
		
		// Handle preprocessing:
		const [processingData, processingError] = await tryRun(async () => {
			return await this.invokePreprocessing(args, config)
		});

		if (processingError) return [false, processingError.message];

		const { filePath, useSourceMap } = processingData;
		
		// Start runner:
		const [runner, runnerError] = await tryRun(async () => {
			const { codeRunner } = await import(`${RUNNER_PATHS[config.runner]}`);
			return await codeRunner.init({ file: filePath, useSourceMap });
		});

		if (runnerError) return [false, runnerError.message];
		
		// Output runner notifications to consumer(s):
		runner.on('notification', data => {
			log(args.file, data);
			const message = jsonrpc.notification('update', { file: args.file, ...data });
			print(message);
		});

		this.instances.set(args.file, runner);
		return [true, 'Code runner started'];
	},

	async invokePreprocessing(args, config) {
		if ('preprocessors' in config && config.preprocessors.includes(PROCESSORS.ESBUILD)) {
			const { default: processor } = await import(PROCESSOR_PATHS[PROCESSORS.ESBUILD]);
			const path = await processor(args.file);
			return { filePath: path, useSourceMap: true }
		}
		return { filePath: args.file, useSourceMap: false };
	},

	stop(args) {
		const runner = this.instances.get(args.file);
		if (!runner) return [false, 'No runner active on file.'];

		runner.emit('stop');
		this.instances.delete(args.file);
		return [true];
	},

	resume(args) {
		const runner = this.instances.get(args.file);
		if (!runner) return [false, 'No runner active on file.'];

		runner.emit('resume');
		return [true];
	},

};
