import { GenericCallback } from '../types.js';
export declare const print: (data: unknown) => void;
declare type tryRunSuccess<T> = [T, null];
declare type tryRunError = [null, Error];
export declare const tryRun: <T>(cb: GenericCallback) => Promise<tryRunError | tryRunSuccess<T>>;
export declare const rpcid: () => number;
export {};
