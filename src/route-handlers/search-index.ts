import vercelCronAuth from './vercel-cron-auth.js';
import { buildClient } from '@datocms/cma-client-browser';

export default async function searchIndex(req: Request): Promise<Response> {
	return vercelCronAuth(req, async (req: Request) => {
		if (!process.env.DATOCMS_ENVIRONMENT) throw new Error('DATOCMS_ENVIRONMENT not set in .env');
		if (!process.env.DATOCMS_API_TOKEN) throw new Error('DATOCMS_API_TOKEN not set in .env');
		if (!process.env.DATOCMS_BUILD_TRIGGER_ID) throw new Error('DATOCMS_BUILD_TRIGGER_ID not set in .env');

		try {
			const client = buildClient({
				environment: process.env.DATOCMS_ENVIRONMENT,
				apiToken: process.env.DATOCMS_API_TOKEN,
				requestTimeout: 3000,
			});

			const triggers = await client.buildTriggers.list();

			if (!triggers.find((t) => t.id === process.env.DATOCMS_BUILD_TRIGGER_ID))
				throw new Error(`Build trigger not found: ${process.env.DATOCMS_BUILD_TRIGGER_ID}`);

			console.log('Search indexing starting...');
			const res = await client.buildTriggers.reindex(process.env.DATOCMS_BUILD_TRIGGER_ID);
			console.log('Search indexing trigged successfully!');

			return new Response(`ok`, {
				status: 200,
			});
		} catch (e) {
			console.error(e);
			return new Response(`Backup failed: ${(e as Error).message}`, { status: 500 });
		}
	});
}
