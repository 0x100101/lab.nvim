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
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { faker } from '@faker-js/faker';
const modules = [
    'address',
    'animal',
    'color',
    'commerce',
    'company',
    'database',
    'datatype',
    'date',
    'finance',
    'git',
    'hacker',
    'image',
    'internet',
    'lorem',
    'music',
    'name',
    'phone',
    'random',
    'science',
    'system',
    'vehicle',
    'word',
];
const tmpPath = await fs.realpath(os.tmpdir());
export const dataFilePath = path.join(tmpPath, 'faker.json');
// Faker emits warnings for deprecated methods.
// This will silence them for now, but isn't a good long term solution.
// eslint-disable-next-line @typescript-eslint/no-empty-function
console.warn = () => { };
export const generate = async () => {
    const data = [];
    for (const mod of modules) {
        if (Object.hasOwn(faker, mod)) {
            for (const method in faker[mod]) {
                if (typeof faker[mod][method] !== 'function')
                    continue;
                try {
                    const fake = faker[mod][method]();
                    if (!fake)
                        continue;
                    data.push({
                        _mod: mod,
                        _method: method,
                        word: `@data.${mod}.${method}`,
                        label: `@data.${mod}.${method}`,
                        detail: `${mod}.${method}()`,
                        insertText: fake.toString(),
                    });
                }
                // eslint-disable-next-line no-empty
                catch { }
            }
        }
    }
    await fs.writeFile(dataFilePath, JSON.stringify(data));
};
export const refresh = (mod, method) => {
    if (Object.hasOwn(faker, mod) && method in faker[mod]) {
        return faker[mod][method]();
    }
    return null;
};
