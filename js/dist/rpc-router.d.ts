import { GenericCallback } from './types.js';
export declare const rpcRouter: {
    request: (method: string, callback: GenericCallback) => void;
    notification: (method: string, callback: GenericCallback) => void;
};
