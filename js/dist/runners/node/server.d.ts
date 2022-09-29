import type { DebuggerProcess } from '../../runners/node/types.js';
export declare const startDebugger: (file: string, ip: string, port: string) => Promise<DebuggerProcess>;
