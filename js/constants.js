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

export const DEBUG = false;

export const RPC_TYPE = {
	REQUEST: 'request',
	NOTIFICATION: 'notification',
};

export const RPC_METHOD = {
	RUNNER_START: 'Lab.Runner.Start',
	RUNNER_STOP: 'Lab.Runner.Stop',
	RUNNER_RESUME: 'Lab.Runner.Resume',
}

export const RUNNER_FILE_MAPPINGS = {
	'js': 'node',
};

export const WS_REGEX = /ws:\/\/\S*/ig;

