import 'dotenv/config';
import { ApiError } from '@datocms/cma-client';
import { buildClient } from '@datocms/cma-client';
const client = buildClient({
    apiToken: process.env.DATOCMS_API_TOKEN,
    environment: process.env.DATOCMS_ENVIRONMENT,
});
export async function getItemReferenceRoutes(itemId, locales) {
    if (!itemId)
        throw new Error('datocms.config: Missing reference: itemId');
    const pathnames = [];
    try {
        const items = await client.items.references(itemId, {
            version: 'published',
            limit: 500,
            nested: true,
        });
        const itemPathnames = await itemsToRoutes(items, locales);
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
export async function getUploadReferenceRoutes(uploadId, locales) {
    if (!uploadId)
        throw new Error('datocms.config: Missing reference: uploadId');
    const pathnames = [];
    try {
        const uploads = await client.uploads.references(uploadId, {
            version: 'published',
            limit: 500,
            nested: true,
        });
        const itemPathnames = await itemsToRoutes(uploads, locales);
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
async function itemsToRoutes(items, locales) {
    const pathnames = [];
    const config = await loadConfig();
    const itemTypes = await client.itemTypes.list();
    for (const item of items) {
        const itemType = itemTypes.find(({ id }) => id === item.item_type.id);
        if (!itemType) {
            console.error(`Item type not found: ${item.item_type.id}`);
            console.log(item);
            continue;
        }
        const record = await getItemWithLinked(item.id);
        if (locales) {
            for (const locale of locales) {
                const p = await config.routes[itemType.api_key]?.(record, locale);
                p && pathnames.push.apply(pathnames, p);
            }
        }
        else {
            const p = await config.routes[itemType.api_key]?.(record);
            p && pathnames.push.apply(pathnames, p);
        }
    }
    return pathnames.length ? pathnames : [];
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
export async function loadConfig() {
    try {
        /*
        const cwd = process.cwd();
        const configPathFull = findConfig();
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const relativePath = path.relative(__dirname, configPathFull);
        const relativeConfigPath = relativePath.substring(0, relativePath.lastIndexOf('.'));
        console.log({ __filename, relativePath, relativeConfigPath });
*/
        //@ts-ignore
        const c = (await import('datocms.config')).default;
        return c;
    }
    catch (e) {
        console.error(e);
        throw new Error('datocms.config not founds');
    }
}
//# sourceMappingURL=utils.js.map