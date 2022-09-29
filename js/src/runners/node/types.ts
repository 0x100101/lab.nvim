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

import type { CodeRunnerNotification } from '@/types.js';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import type { WebSocket } from 'ws';

export type DebuggerMessageHandler = (message: DebuggerMessage) => CodeRunnerNotification | null;

export interface DebuggerProcess {
	server: ChildProcessWithoutNullStreams,
	stop: () => void,
	processData: (data: string) => void,
	url: string,
}

export interface DebuggerConnection {
	connection: WebSocket,
	command: {
		resume: () => void,
		initialize: () => void,
	}
}

export interface DebuggerMessage {
	__file: string,
	method: string,
	params: {
		type: string,
		args: [
			{ 
				type: string, 
				value: unknown, 
				description: string, 
				subtype: string,
				preview: {
					properties: [{
						type: string,
						name: string,
						value: unknown,
					}]
				}
			}
		],
		reason: string,
		callFrames: [
			{ 
				url: string,
				location: {
					lineNumber: number,
					columnNumber: number,
				} 
			}
		],
		stackTrace: {
			callFrames: [{ url: string, functionName: string, lineNumber: number, columnNumber: number }],
		},
		exceptionDetails: {
			stackTrace: {
				callFrames: [
					{ 
						url: string,
						lineNumber: number,
						columnNumber: number,
					}
				],
			},
			exception: {
				description: string,
				preview: {
					properties: [{ name: string, value: string, }],
				}
			},
		},
	},
	arg : {
		type: string,
		subtype: string,
		preview: {
			properties: [
				{ name: string, type: string, value: unknown }
			],
		}
	}
}