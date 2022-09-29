/// <reference types="node" resolution-mode="require"/>
import type { CodeRunnerNotification } from '../../types.js';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import type { WebSocket } from 'ws';
export declare type DebuggerMessageHandler = (message: DebuggerMessage) => CodeRunnerNotification | null;
export interface DebuggerProcess {
    server: ChildProcessWithoutNullStreams;
    stop: () => void;
    processData: (data: string) => void;
    url: string;
}
export interface DebuggerConnection {
    connection: WebSocket;
    command: {
        resume: () => void;
        initialize: () => void;
    };
}
export interface DebuggerMessage {
    __file: string;
    method: string;
    params: {
        type: string;
        args: [
            {
                type: string;
                value: unknown;
                description: string;
                subtype: string;
                preview: {
                    properties: [
                        {
                            type: string;
                            name: string;
                            value: unknown;
                        }
                    ];
                };
            }
        ];
        reason: string;
        callFrames: [
            {
                url: string;
                location: {
                    lineNumber: number;
                    columnNumber: number;
                };
            }
        ];
        stackTrace: {
            callFrames: [{
                url: string;
                functionName: string;
                lineNumber: number;
                columnNumber: number;
            }];
        };
        exceptionDetails: {
            stackTrace: {
                callFrames: [
                    {
                        url: string;
                        lineNumber: number;
                        columnNumber: number;
                    }
                ];
            };
            exception: {
                description: string;
                preview: {
                    properties: [{
                        name: string;
                        value: string;
                    }];
                };
            };
        };
    };
    arg: {
        type: string;
        subtype: string;
        preview: {
            properties: [
                {
                    name: string;
                    type: string;
                    value: unknown;
                }
            ];
        };
    };
}
