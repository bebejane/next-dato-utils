import { buildClient } from '@datocms/cma-client';
import promiseBatch from '../utils/promise-batch.js';
import { Upload } from '@datocms/cma-client/dist/types/generated/ApiTypes.js';

const client = buildClient({
	apiToken: process.env.DATOCMS_API_TOKEN,
	environment: process.env.DATOCMS_ENVIRONMENT || 'main',
});

export type WebPreview = {
	label: string;
	url: string;
};
export type WebPreviewResult = {
	links: WebPreview[];
	api_key: string;
	locale: string;
	itemId: string;
	itemTypeId: string;
} | null;

export type RevalidateResult = {
	revalidated: boolean;
	paths: string[];
	delays: number;
	event_type: string;
	api_key: string;
	locale: string;
	itemId: string;
	itemTypeId: string | null | undefined;
} | null;

export const baseApiUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api`;

export const testWebPreviewsEndpoint = async (api_key: string, locale: string): Promise<WebPreviewResult> => {
	const item = (await client.items.list({ filter: { type: api_key }, version: 'published', limit: 1 }))?.[0] as any;
	if (!item) throw `Web Previews: no item found - ${api_key}`;
	const itemType = await client.itemTypes.find(item.item_type.id);

	const res = await fetch(`${baseApiUrl}/web-previews`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Basic ${btoa(`${process.env.BASIC_AUTH_USER}:${process.env.BASIC_AUTH_PASSWORD}`)}`,
		},
		body: JSON.stringify({
			item: {
				attributes: item || {},
			},
			itemType: {
				attributes: itemType,
			},
			environmentId: process.env.DATOCMS_ENVIRONMENT || 'main',
			locale,
		}),
	});

	const json = await res.json();
	return { links: json.previewLinks, itemId: item.id, api_key, locale, itemTypeId: itemType.id };
};

export const testRevalidateEndpoint = async (api_key: string, locale: string): Promise<RevalidateResult> => {
	const item = (await client.items.list({ filter: { type: api_key }, version: 'published', limit: 1 }))?.[0];
	if (!item) throw `Revalidate: no item found - ${api_key}`;
	const itemType = await client.itemTypes.find(item.item_type.id);
	const res = await fetch(`${baseApiUrl}/revalidate`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Basic ${btoa(`${process.env.BASIC_AUTH_USER}:${process.env.BASIC_AUTH_PASSWORD}`)}`,
		},
		body: JSON.stringify({
			locale: locale,
			environment: process.env.DATOCMS_ENVIRONMENT || 'main',
			entity_type: 'item',
			event_type: 'update',
			entity: {
				id: item.id,
				type: 'item',
				attributes: {
					...(item || {}),
				},
				relationships: {
					item_type: {
						data: {
							id: item.item_type.id,
							type: 'item_type',
						},
					},
				},
				meta: {
					...item.meta,
					updated_at: new Date().toISOString(),
					published_at: new Date().toISOString(),
					created_at: new Date().toISOString(),
				},
			},
			related_entities: [
				{
					id: item.item_type.id,
					type: 'item_type',
					attributes: itemType,
				},
			],
		}),
	});
	if (res.status === 200) {
		const json = await res.json();
		return { ...json.response, api_key, locale, itemId: item.id, itemTypeId: itemType.id };
	} else {
		throw new Error(`Error revalidate ${api_key}: ${res.status} ${res.statusText}`);
	}
};

export const testRevalidateUploadEndpoint = async (): Promise<{
	revalidate: RevalidateResult | null;
	preview: WebPreviewResult | null;
}> => {
	let upload: Upload | null = null;
	let count = 0;
	for await (const u of client.uploads.listPagedIterator({ version: 'current', order_by: '_updated_at_DESC' })) {
		const ref = await client.uploads.references(u.id, { version: 'current', limit: 1 });
		process.stdout.write('.');
		if (ref.length > 0) {
			console.log('found upload:', u.id);
			upload = u;
			break;
		}
		if (count++ > 100) break;
	}

	if (!upload) throw `Revalidate: no upload with ref found`;

	const fetchOptions = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Basic ${btoa(`${process.env.BASIC_AUTH_USER}:${process.env.BASIC_AUTH_PASSWORD}`)}`,
		},
		body: JSON.stringify({
			environment: process.env.DATOCMS_ENVIRONMENT || 'main',
			entity_type: 'upload',
			event_type: 'update',
			entity: {
				id: upload.id,
				type: 'item',
				attributes: {
					...upload,
				},
				relationships: {},
				meta: {},
			},
			related_entities: [],
		}),
	};
	const r = await fetch(`${baseApiUrl}/revalidate`, fetchOptions);
	const result = { revalidate: null, preview: null };
	if (r.status === 200)
		result.revalidate = { ...(await r.json()).response, api_key: 'upload', itemId: upload.id, itemTypeId: null };
	return result;
};

export async function testAllEndpoints(
	locale: string,
	limit: number = 5
): Promise<{ revalidate: RevalidateResult; preview: WebPreviewResult }[]> {
	const site = await client.site.find();
	const itemTypes = await client.itemTypes.list();
	const models = itemTypes.filter((t) => !t.modular_block);

	console.log(`Testing site: ${site.name} with ${models.length} models!`);

	const results = await promiseBatch<{ revalidate: RevalidateResult; preview: WebPreviewResult }>(
		models.map((m) => async () => {
			const [revalidate, preview] = await Promise.all([
				testRevalidateEndpoint(m.api_key, locale),
				testWebPreviewsEndpoint(m.api_key, locale),
			]).catch((e) => {
				console.error(e);
				return [null, null];
			});
			return { revalidate, preview };
		}),
		limit
	);
	const uploadResult = await testRevalidateUploadEndpoint();
	if (uploadResult) results.push(uploadResult);
	console.log(`Testing site: ${site.name} with ${models.length} models.`);
	console.log(uploadResult);
	//@ts-ignore
	return results.sort((a, b) => (a?.revalidate?.api_key > b?.revalidate?.api_key ? 1 : -1));
}
