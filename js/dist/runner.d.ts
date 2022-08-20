import type { RunnerParams, CodeRunnerConfig } from './types.js';
export declare const runner: {
    instances: Map<any, any>;
    start: (args: RunnerParams) => Promise<[false, string] | [true]>;
    invokePreprocessing(args: RunnerParams, config: CodeRunnerConfig): Promise<{
        filePath: any;
        useSourceMap: boolean;
    }>;
    stop(args: Omit<RunnerParams, 'config'>): [false, string] | [true];
    resume(args: Omit<RunnerParams, 'config'>): [false, string] | [true];
};
