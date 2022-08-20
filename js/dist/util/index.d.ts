export declare const print: (data: unknown) => void;
declare type Callback = (...args: any[]) => any;
declare type tryRunSuccess<T> = [T, null];
declare type tryRunError = [null, Error];
export declare const tryRun: <T>(cb: Callback) => Promise<tryRunError | tryRunSuccess<T>>;
export declare const rpcid: () => number;
export {};
