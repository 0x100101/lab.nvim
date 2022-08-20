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
export const print = (data) => {
    console.log(JSON.stringify(data));
};
export const tryRun = async (cb) => {
    try {
        const ret = await cb();
        return [ret, null];
    }
    catch (err) {
        return [null, err];
    }
};
export const rpcid = (function idGenerator() {
    let i = 0;
    return () => {
        if (i++ == 50)
            i = 1;
        return i;
    };
})();
