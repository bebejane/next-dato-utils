import { NextRequest } from 'next/server.js';
import { DatoCmsConfig } from '../config/index.js';
import {
	backup,
	revalidate,
	test,
	webPreviews,
	draft,
	basicAuth,
	search,
	searchIndex,
} from '../route-handlers/index.js';

export type RouteHandler = (
	req: Request,
	{ params }: { params: Promise<{ route: string }> },
	config: DatoCmsConfig,
) => Promise<Response>;

export type DatoCmsRouter = {
	POST: RouteHandler;
	GET: RouteHandler;
};

const POST: RouteHandler = async (req, { params }, config) => {
	const { route } = await params;

	try {
		switch (route) {
			case 'revalidate':
				return basicAuth(req, (req) =>
					revalidate(req, async (payload, revalidate) => {
						const { entity } = payload;
						const api_key = payload.entity_type === 'upload' ? 'upload' : payload.api_key;
						const { id, attributes } = entity;
						if (!api_key) throw new Error('No api_key found');
						let paths: string[] = [];

						const record = { api_key, ...attributes, id };
						if (config.revalidate) paths = await config.revalidate(record);
						else if (config.i18n) {
							for (const locale of config.i18n.locales) {
								const p = await config.routes?.[api_key]?.(record, locale);
								p && paths.push.apply(paths, p);
							}
						} else paths = (await config.routes?.[api_key]?.(record)) ?? [];

						const tags: string[] = [api_key, id].filter((t) => t);
						return await revalidate(paths, tags, true);
					}),
				);
			case 'web-previews':
				return webPreviews(req, async (payload) => {
					const { item, itemType, locale } = payload;
					if (!item || !itemType) throw new Error('No item or itemType found');
					const record = {
						id: item.id,
						api_key: itemType?.attributes?.api_key,
						...item.attributes,
					};
					if (config.webPreviews) return config.webPreviews(record, locale);
					const path = config.route
						? await config.route(record, locale)
						: (await config.routes[itemType.attributes.api_key]?.(record, locale))?.[0];
					return path ?? null;
				});
			case 'search':
				return search(req);
			default:
				return new Response('Not Found', { status: 404 });
		}
	} catch (e) {
		return new Response((e as Error).message, { status: 500 });
	}
};

const GET: RouteHandler = async (req, { params }, config) => {
	try {
		const { route } = await params;
		const searchParams = (req as NextRequest).nextUrl.searchParams;

		switch (route) {
			case 'search-index':
				return searchIndex(req);
			case 'test':
				return test(req);
			case 'draft':
				return draft(req, searchParams);
			case 'backup':
				return backup(req);
			default:
				return new Response('Not Found', { status: 404 });
		}
	} catch (e) {
		return new Response((e as Error).message, { status: 500 });
	}
};

const router = async function (req, { params }, config) {
	const method = req.method.toLowerCase();
	switch (method) {
		case 'post':
			return POST(req, { params }, config);
		case 'get':
			return GET(req, { params }, config);
		default:
			return new Response('Not Found', { status: 404 });
	}
} satisfies RouteHandler;

export default router;
