import fs from 'fs';

const packages = [
	'api',
	'components',
	'hooks',
	'route-handlers',
	'server-actions',
	'utils',
	'cli',
	'config',
	'router',
	'tests',
];

export default function clean() {
	console.log('Cleaning up...');
	for (const pkg of packages) {
		if (fs.existsSync(`./${pkg}`)) fs.rmSync(`./${pkg}`, { recursive: true });
	}
	if (fs.existsSync(`./dist`)) fs.rmSync(`./dist`, { recursive: true });
}

clean();
