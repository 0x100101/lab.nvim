/// <reference types="node" resolution-mode="require"/>
import { EventEmitter } from 'events';
export declare const init: ({ file, useSourceMap, ip, port }: {
    file?: string | undefined;
    useSourceMap?: boolean | undefined;
    ip?: string | undefined;
    port?: string | undefined;
}) => Promise<EventEmitter>;
