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

export const injectionOffset = 11;

export default `import inspect
import builtins
import itertools

def print(*args, **kwargs):
  callerframerecord = inspect.stack()[1]
  frame = callerframerecord[0]
  info = inspect.getframeinfo(frame)
  args = itertools.chain(["==labnvim==<print:" + str(info.lineno - ${injectionOffset}) + ">"], args)
  builtins.print(*args, **kwargs)
`;