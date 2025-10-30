import 'dotenv/config';
import { buildClient } from '@datocms/cma-client';
import { testAllEndpoints } from './src/tests/endpoints.js';

const client = buildClient({
	apiToken: process.env.DATOCMS_API_TOKEN as string,
	environment: process.env.DATOCMS_ENVIRONMENT || 'main',
});

async function test() {
	console.time('test');
	const res = await testAllEndpoints('en', 15);
	console.log(JSON.stringify(res, null, 2));
	console.timeEnd('test');
}

test();
