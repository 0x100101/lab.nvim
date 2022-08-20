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
export var CodeRunnerMethod;
(function (CodeRunnerMethod) {
    CodeRunnerMethod["Start"] = "Lab.Runner.Start";
    CodeRunnerMethod["Stop"] = "Lab.Runner.Stop";
    CodeRunnerMethod["Resume"] = "Lab.Runner.Resume";
    CodeRunnerMethod["Feedback"] = "Lab.Runner.Feedback";
})(CodeRunnerMethod || (CodeRunnerMethod = {}));
export var ConfigMethod;
(function (ConfigMethod) {
    ConfigMethod["Get"] = "Lab.Config.Get";
})(ConfigMethod || (ConfigMethod = {}));
export var QuickDataMethod;
(function (QuickDataMethod) {
    QuickDataMethod["Update"] = "Lab.QuickData.Update";
})(QuickDataMethod || (QuickDataMethod = {}));
export var Processors;
(function (Processors) {
    Processors["EsBuild"] = "lab.esbuild";
})(Processors || (Processors = {}));
export var Runners;
(function (Runners) {
    Runners["Node"] = "lab.node";
    Runners["Python"] = "lab.python";
    Runners["Lua"] = "lab.lua";
})(Runners || (Runners = {}));
export const PROCESSORS_PATH = './processors/';
export const RUNNERS_PATH = './runners/';
export const PROCESSOR_PATHS = {
    [Processors.EsBuild]: PROCESSORS_PATH + 'esbuild.js',
};
export const RUNNER_PATHS = {
    [Runners.Node]: RUNNERS_PATH + 'node/node.js',
    [Runners.Python]: RUNNERS_PATH + 'python/python.js',
    [Runners.Lua]: RUNNERS_PATH + 'lua/lua.js',
};
