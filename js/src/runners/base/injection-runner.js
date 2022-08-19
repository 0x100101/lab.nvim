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
import os from 'node:os';
import fs from 'node:fs/promises';
import EventEmitter from 'node:events';
import { logger } from '@/util/logging.js';
import { tryRun } from '@/util/index.js';
import { murmurhash3 } from '@/util/murmurhash.js';

export default {

	async init({ file }) {
		this.log = logger(`coderunner.${this.name}`);

		this.paths = {};
		this.paths.fileName = path.basename(file);
		this.paths.tmpDir = await fs.realpath(os.tmpdir());
		this.paths.tmpFileName = `${murmurhash3(path.basename(file))}${path.extname(file)}`;
		this.paths.tmpFilePath = path.join(this.paths.tmpDir, this.paths.tmpFileName);

		const code = await fs.readFile(file, { encoding: 'utf8' });
		await fs.writeFile(this.paths.tmpFilePath, (this.embed + code));

		this.log(this.paths.tmpFilePath);

		const [spawned, spawnedError] = await tryRun(() => {
			return this.runCode(this.paths.tmpFilePath);
		});

		if (spawnedError) throw new Error(spawnedError.message);

		spawned.proc.stdout.on('data', data => {
			this.stdout(data.toString());
		});

		spawned.proc.stderr.on('data', data => {
			this.stderr(data.toString());
		});

		this.emitter = new EventEmitter();
		this.emitter.on('stop', spawned.stop);
		this.emitter.on('resume', spawned.resume);

		return this.emitter;
	},

	async runCode(file) {
		return new Promise((resolve, reject) => {
			const spawned = {};
			spawned.proc = this.spawner(file);
			spawned.proc.on('error', reject);
			spawned.stop = () => spawned.proc.kill('SIGHUP');
			spawned.resume = () => spawned.proc.stdio[0].write('c\n');
			process.on('uncaughtExceptionMonitor', spawned.stop);
			setTimeout(() => {
				resolve(spawned);
			}, 1);
		});
	},

};
