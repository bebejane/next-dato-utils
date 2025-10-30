import { buildClient } from '@datocms/cma-client';
import promiseBatch from '../utils/promise-batch.js';
const client = buildClient({
    apiToken: process.env.DATOCMS_API_TOKEN,
    environment: process.env.DATOCMS_ENVIRONMENT || 'main',
});
export const baseApiUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api`;
export const testWebPreviewsEndpoint = async (api_key, locale) => {
    const item = (await client.items.list({ filter: { type: api_key }, version: 'published', limit: 1 }))?.[0];
    if (!item)
        throw `Web Previews: no item found - ${api_key}`;
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
    return { links: json.previewLinks, item, api_key, locale };
};
export const testRevalidateEndpoint = async (api_key, locale) => {
    const item = (await client.items.list({ filter: { type: api_key }, version: 'published', limit: 1 }))?.[0];
    if (!item)
        throw `Revalidate: no item found - ${api_key}`;
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
        return { ...json.response, api_key, locale, item };
    }
    else {
        throw new Error(`Error revalidate ${api_key}: ${res.status} ${res.statusText}`);
    }
};
export async function testAllEndpoints(locale, limit = 5) {
    const site = await client.site.find();
    const itemTypes = await client.itemTypes.list();
    const models = itemTypes.filter((t) => !t.modular_block);
    console.log(`Testing site: ${site.name} with ${models.length} models`);
    const results = await promiseBatch(models.map((m) => async () => {
        const [revalidate, preview] = await Promise.all([
            testRevalidateEndpoint(m.api_key, locale),
            testWebPreviewsEndpoint(m.api_key, locale),
        ]).catch((e) => {
            console.error(e);
            return [null, null];
        });
        return { revalidate, preview };
    }), limit);
    return results.sort((a, b) => (a?.preview?.api_key > b?.preview?.api_key ? 1 : -1));
}
//# sourceMappingURL=endpoints.js.map