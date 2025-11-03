import { buildClient } from '@datocms/cma-client';

type SearchQuery = {
	q: string;
	locale: string;
	limit?: string;
	offset?: string;
	fuzzy?: string;
};

export default async function search(req: Request): Promise<Response> {
	try {
		if (!process.env.DATOCMS_API_TOKEN) throw 'DATOCMS_API_TOKEN not set in .env';
		if (!process.env.DATOCMS_BUILD_TRIGGER_ID) throw 'DATOCMS_BUILD_TRIGGER_ID not set in .env';

		const client = buildClient({ apiToken: process.env.DATOCMS_API_TOKEN as string });
		const payload = (await req.json()) as SearchQuery;

		if (!payload || !payload.q) throw 'Payload empty or missing q';

		const query = payload.q;
		const locale = payload.locale;
		const limit = payload.limit ? parseInt(payload.limit) : 20;
		const offset = payload.offset ? parseInt(payload.offset) : 0;
		const fuzzy = payload.fuzzy ? (payload.fuzzy === 'false' ? false : true) : true;

		if (typeof query !== 'string') throw 'Payload missing q or not a string';
		if (isNaN(limit)) throw 'Payload limit not a number';
		if (isNaN(offset)) throw 'Payload offset not a number';

		const { data: results, meta } = await client.searchResults.rawList({
			filter: {
				fuzzy,
				query,
				build_trigger_id: process.env.DATOCMS_BUILD_TRIGGER_ID,
				locale: locale ?? undefined,
			},
			page: {
				limit,
				offset,
			},
		});

		return new Response(JSON.stringify({ results, meta }), {
			status: 200,
			headers: { 'content-type': 'application/json' },
		});
	} catch (e) {
		console.error(e);
		return new Response(`Search failed: ${(e as Error).message}`, { status: 500 });
	}
}
