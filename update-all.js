import fs from 'fs';
import { globSync } from 'glob';
import { execSync } from 'child_process';
import path from 'path';

const version = JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
const basePath = '/Users/bebejane/work/konstochteknik';
let packages = globSync(`${basePath}/**/package.json`, {
	maxDepth: 3,
	ignore: ['**/node_modules/**', '**/.git/**'],
});

const project = process.argv.slice(2)?.[0] ?? null;

if (project) {
	if (!packages.includes(`${basePath}/${project}/package.json`)) {
		console.error(`project ${project} not found`);
		process.exit(1);
	}
	packages = [`${basePath}/${project}/package.json`];
}

(async () => {
	console.log('');
	console.log(`Running updates for version ${version} (${packages.length} packages)`);
	console.log('-----------------------------------------------------------------');

	const stats = {
		success: 0,
		failed: 0,
		skipped: 0,
	};

	for (let i = 0; i < packages.length; i++) {
		const pckg = JSON.parse(fs.readFileSync(packages[i], 'utf8'));
		if (!pckg.dependencies || !Object.keys(pckg.dependencies).includes('next-dato-utils')) continue;

		const name = path.dirname(packages[i]).split('/').pop();
		const cwd = path.dirname(packages[i]);
		const currentVersion = JSON.parse(
			fs.readFileSync(`${cwd}/node_modules/next-dato-utils/package.json`, 'utf8')
		).version;
		const isClean = execSync(`git status --porcelain --untracked-files=no`, { cwd }).length === 0;

		if (isClean && currentVersion === version) {
			console.log(`${name}: skipping ${version} (already up to date)`);
			stats.skipped++;
			continue;
		}
		if (!isClean) {
			console.log(`${name}: skipping (not clean) `);
			stats.skipped++;
			continue;
		}

		try {
			console.log(`${name}: updating package ${version}...`);
			//execSync(`pnpm i react@19.2.1 react-dom@19.2.1`, { cwd, stdio: 'pipe' });
			execSync(`pnpm i github:bebejane/next-dato-utils#v${version}`, { cwd, stdio: 'pipe' });
		} catch (e) {
			console.log(`${name}: failed to update package`);
			console.log(e);
			stats.failed++;
			continue;
		}
		try {
			console.log(`${name}: git push`);
			execSync(
				`git add . && git commit -m \"updated next-dato-utils to v${version}\" && git push`,
				{
					cwd,
					stdio: 'pipe',
				}
			);
			console.log(`${name}: done!`);
			stats.failed++;
		} catch (e) {
			console.log(`${name}: failed to push package`);
			console.log(e);
			stats.failed++;
			continue;
		}
	}
	console.log(
		`\nDone! ${stats.success} repos updated, ${stats.failed} failed, ${stats.skipped} skipped`
	);
})();
