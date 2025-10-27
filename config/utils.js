import 'dotenv/config';
import { ApiError } from '@datocms/cma-client';
import { buildClient } from '@datocms/cma-client';
const client = buildClient({
    apiToken: process.env.DATOCMS_API_TOKEN,
    environment: process.env.DATOCMS_ENVIRONMENT,
});
export async function getItemReferenceRoutes(itemId, routes, locales) {
    if (!itemId)
        throw new Error('datocms.config: Missing reference: itemId');
    //@ts-expect-error
    const c = import('../../datocms.config.js');
    const pathnames = [];
    try {
        const items = await client.items.references(itemId, {
            version: 'published',
            limit: 500,
            nested: true,
        });
        const itemPathnames = await itemsToRoutes(items, routes, locales);
        itemPathnames && pathnames.push.apply(pathnames, itemPathnames);
    }
    catch (e) {
        if (e instanceof ApiError) {
            console.error(e.message);
            throw e.message;
        }
        console.error(e);
        throw e;
    }
    return pathnames;
}
export async function getUploadReferenceRoutes(uploadId, routes, locales) {
    if (!uploadId)
        throw new Error('datocms.config: Missing reference: itemId');
    const pathnames = [];
    try {
        const uploads = await client.uploads.references(uploadId, {
            version: 'published',
            limit: 500,
            nested: true,
        });
        const itemPathnames = await itemsToRoutes(uploads, routes, locales);
        itemPathnames && pathnames.push.apply(pathnames, itemPathnames);
    }
    catch (e) {
        if (e instanceof ApiError) {
            console.error(e.message);
            throw e.message;
        }
        console.error(e);
        throw e;
    }
    return pathnames;
}
async function itemsToRoutes(items, routes, locales) {
    const pathnames = [];
    const itemTypes = await client.itemTypes.list();
    for (const item of items) {
        const itemType = itemTypes.find(({ id }) => id === item.item_type.id);
        if (!itemType)
            continue;
        const record = await getItemWithLinked(item.id);
        if (locales) {
            for (const locale of locales) {
                const p = await routes[itemType.api_key]?.(record, locale);
                p && pathnames.push.apply(pathnames, p);
            }
        }
        else {
            const p = await routes[itemType.api_key]?.(record);
            p && pathnames.push.apply(pathnames, p);
        }
    }
    return pathnames.length ? pathnames : null;
}
export async function getItemWithLinked(id) {
    const record = await client.items.find(id, { nested: true, version: 'current' });
    const itemTypeId = record.item_type.id;
    const fields = await client.fields.list(itemTypeId);
    const linkFields = fields.filter((f) => f.field_type === 'link' || f.field_type === 'links');
    const ids = new Set();
    for (const f of linkFields) {
        const value = record[f.api_key];
        if (!value)
            continue;
        if (Array.isArray(value))
            value.forEach((v) => ids.add(v));
        else
            ids.add(value);
    }
    const linkedRecords = ids.size
        ? await client.items.list({
            filter: { ids: Array.from(ids).join(',') },
            version: 'current',
        })
        : [];
    Object.keys(record).forEach((key) => {
        record[key] = linkedRecords.find((r) => r.id === record[key]) ?? record[key];
    });
    return record;
}
//# sourceMappingURL=utils.js.map