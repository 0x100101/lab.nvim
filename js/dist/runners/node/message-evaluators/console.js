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
const objPreview = {
    output: '',
    wrap(type) {
        this.output = (type === 'array') ? `[ ${this.trim(this.output)} ]` : `{ ${this.trim(this.output)} }`;
        return this;
    },
    trim(str) {
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
    format(data) {
        this.output = data.reduce((a, c) => {
            return `${a}${c.name}: ${this.formatValue(c)}, `;
        }, '');
        return this;
    },
};
export const consoleHandler = (message) => {
    const frame = message.params.stackTrace.callFrames.find(frame => frame.url === `file://${message.__file}`);
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
                        return objPreview.format(arg.preview.properties).wrap('array').output;
                    default:
                        return objPreview.format(arg.preview.properties).wrap('object').output;
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
