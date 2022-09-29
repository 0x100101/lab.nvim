import type { DebuggerConnection } from '../../runners/node/types.js';
export declare const establishConnection: (url: string) => Promise<DebuggerConnection>;
