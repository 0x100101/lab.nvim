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
import { readFile } from 'fs/promises';
import { decode } from 'sourcemap-codec';
export const loadSourceMappings = async (file) => {
    try {
        const sourceMap = await readFile(file + '.map', { encoding: 'utf8' });
        const mappings = JSON.parse(sourceMap).mappings;
        return decode(mappings);
    }
    catch (e) {
        return [];
    }
};
