import jsonrpc from 'jsonrpc-lite';
interface RPCMessage<T> extends jsonrpc.JsonRpc {
    payload: {
        id: string | number;
        params: T;
    };
}
export interface RunnerParams {
    file: string;
    config: string;
}
interface QuickDataParams {
    mod: string;
    method: string;
}
interface ConfigParams {
    key: string;
}
export declare type CodeRunnerMessage = RPCMessage<RunnerParams>;
export declare type QuickDataMessage = RPCMessage<QuickDataParams>;
export declare type ConfigMessage = RPCMessage<ConfigParams>;
export declare enum CodeRunnerMethod {
    Start = "Lab.Runner.Start",
    Stop = "Lab.Runner.Stop",
    Resume = "Lab.Runner.Resume"
}
declare type Preprocessors = 'lab.esbuild';
declare type Runners = 'lab.node' | 'lab.python' | 'lab.lua';
export interface CodeRunnerConfig {
    version: number;
    preprocessors: Array<Preprocessors>;
    runner: Runners;
}
export interface PreprocessingData {
    filePath: string;
    useSourceMap: boolean;
}
export interface CodeRunnerNotification {
    event: string;
    type?: string;
    line: number;
    col?: number;
    text: string;
    description?: string;
}
export declare type GenericCallback = (...args: any[]) => any;
export {};
