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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findFrame(file, callFrames) {
    return callFrames.find(frame => frame.url === `file://${file}`);
}
export const pauseHandler = (message) => {
    const frame = findFrame(message.__file, message.params.callFrames);
    if (!frame)
        return null;
    return {
        event: 'paused',
        text: 'Paused',
        line: frame.location.lineNumber,
        col: frame.location.columnNumber,
    };
};
export const errorHandler = (message) => {
    // In the case of an error, if we can't find a frame originating in the active file, for clarity we'll still show it on line one.
    let frame = findFrame(message.__file, message.params.exceptionDetails.stackTrace.callFrames);
    if (!frame)
        frame = { lineNumber: 0, columnNumber: 0 };
    const text = message.params.exceptionDetails.exception.preview.properties.find(items => items.name === 'message');
    const description = message.params.exceptionDetails.exception.description.replaceAll(/\n/g, '');
    return {
        event: 'error',
        text: text?.value || '',
        description: description || '',
        line: frame.lineNumber,
        col: frame.columnNumber,
    };
};
const objPreview = {
    wrap(str, type) {
        return (type === 'array') ? `[ ${this.slice(str)} ]` : `{ ${this.slice(str)} }`;
    },
    slice(str) {
        return str.slice(0, -2);
    },
    formatValue(item) {
        switch (item.type) {
            case 'function':
                return '';
            case 'string':
                return `"${item.value}"`;
            default:
                return item.value;
        }
    },
    build(data) {
        return data.reduce((a, c) => {
            return `${a}${c.name}: ${this.formatValue(c)}, `;
        }, '');
    },
    format(data, type) {
        return this.wrap(this.build(data), type);
    },
};
export const consoleHandler = (message) => {
    const frame = findFrame(message.__file, message.params.stackTrace.callFrames);
    if (!frame)
        return null;
    const preview = message.params.args.reduce((preview, arg) => {
        switch (arg.type) {
            case 'function':
            case 'symbol':
                return `${preview} ${arg.description}`;
            case 'object': {
                switch (arg.subtype) {
                    case 'null':
                        return `${preview} null`;
                    case 'array':
                        return objPreview.format(arg.preview.properties, 'array');
                    default:
                        return objPreview.format(arg.preview.properties, 'object');
                }
            }
            default:
                return `${preview}${arg.value}`;
        }
    }, '');
    return {
        event: 'log',
        type: message.params.type,
        line: frame.lineNumber,
        col: frame.columnNumber,
        text: preview,
    };
};
export const consoleTraceHandler = (message) => {
    const frame = findFrame(message.__file, message.params.stackTrace.callFrames);
    if (!frame)
        return null;
    const preview = message.params.stackTrace.callFrames.reduce((preview, frame) => {
        if (!frame.url.startsWith('node:')) {
            const fn = frame.functionName || '<anonymous>';
            return `${preview}${fn}  `;
        }
        return preview;
    }, '').slice(0, -3);
    return {
        event: 'log',
        type: message.params.type,
        line: frame.lineNumber,
        col: frame.columnNumber,
        text: preview,
    };
};
