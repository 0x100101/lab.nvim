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
import { CodeRunnerMethod, Processors, RUNNER_PATHS } from './constants.js';
const log = logger('lab.runner');
var LANG;
(function (LANG) {
    LANG["MISSING_FILE_PATH"] = "No file path specified.";
    LANG["MISSING_CONFIG"] = "No config provided.";
    LANG["MISSING_RUNNER"] = "No runner configured.";
    LANG["ALREADY_RUNNING"] = "Already running on this file.";
    LANG["NOT_RUNNING"] = "No runner active on this file.";
    LANG["ESBUILD_FAIL_RECOGNIZED"] = "Esbuild failed with a recognized error.";
})(LANG || (LANG = {}));
export const runner = {
    instances: new Map(),
    start: async function (args) {
        log(args);
        // Validate inputs:
        if (!('file' in args))
            return [false, LANG.MISSING_FILE_PATH];
        if (!('config' in args))
            return [false, LANG.MISSING_CONFIG];
        if (this.instances.has(args.file))
            return [false, LANG.ALREADY_RUNNING];
        // Parse config:
        const [config, configError] = await tryRun(() => {
            return JSON.parse(args.config);
        });
        if (configError)
            return [false, configError.message];
        if (!('runner' in config))
            return [false, LANG.MISSING_RUNNER];
        // Handle preprocessing:
        const [processingData, processingError] = await tryRun(async () => {
            return await this.invokePreprocessing(args, config);
        });
        if (processingError)
            return [false, processingError.message];
        const { filePath, useSourceMap } = processingData;
        // Start runner:
        const [runner, runnerError] = await tryRun(async () => {
            if (config.runner === 'lab.node') {
                const { init } = await import(`${RUNNER_PATHS[config.runner]}`);
                return await init({ file: filePath, useSourceMap });
            }
            else {
                const { codeRunner } = await import(`${RUNNER_PATHS[config.runner]}`);
                return await codeRunner.init({ file: filePath, useSourceMap });
            }
        });
        if (runnerError)
            return [false, runnerError.message];
        // Output runner notifications to consumer(s):
        runner.on('notification', (data) => {
            log(args.file, data);
            const message = jsonrpc.notification(CodeRunnerMethod.Feedback, { file: args.file, ...data });
            print(message);
        });
        this.instances.set(args.file, runner);
        return [true];
    },
    async invokePreprocessing(args, config) {
        if ('preprocessors' in config && config.preprocessors.includes(Processors.EsBuild)) {
            const { default: processor } = await import('./processors/esbuild.js');
            const [data, error] = await processor(args.file);
            if (error) {
                const message = jsonrpc.notification(CodeRunnerMethod.Feedback, { file: args.file, ...data });
                print(message);
                throw new Error(LANG.ESBUILD_FAIL_RECOGNIZED);
            }
            return { filePath: data, useSourceMap: true };
        }
        return { filePath: args.file, useSourceMap: false };
    },
    stop(args) {
        const runner = this.instances.get(args.file);
        if (!runner)
            return [false, LANG.NOT_RUNNING];
        runner.emit('stop');
        this.instances.delete(args.file);
        return [true];
    },
    resume(args) {
        const runner = this.instances.get(args.file);
        if (!runner)
            return [false, LANG.NOT_RUNNING];
        runner.emit('resume');
        return [true];
    },
};
