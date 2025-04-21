"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = revalidate;
const cache_js_1 = require("next/cache.js");
//import basicAuth from "./basic-auth";
async function revalidate(req, callback) {
    const payload = await req.json();
    if (!payload || !payload?.entity)
        return new Response('Payload empty or missing entity', { status: 400 });
    const { entity, related_entities, event_type, entity_type } = payload;
    const api_key = related_entities?.find(({ id }) => id === entity.relationships?.item_type?.data?.id)?.attributes?.api_key;
    const delay = parseDelay(entity);
    const now = Date.now();
    const response = { revalidated: false, event_type, entity_type, api_key, delay, now };
    const transformedPayload = { entity, event_type, entity_type, api_key };
    return await callback(transformedPayload, async (paths, tags, logs = false) => {
        try {
            if (logs) {
                console.log('revalidate', 'paths', paths, 'tags', tags);
                console.log(response);
            }
            if ((!paths && !tags) || (!paths.length && !tags.length))
                return new Response(JSON.stringify(response), { status: 200, headers: { 'content-type': 'application/json' } });
            paths?.forEach(p => (0, cache_js_1.revalidatePath)(p));
            tags?.forEach(t => (0, cache_js_1.revalidateTag)(t));
            return new Response(JSON.stringify({ ...response, revalidated: true, paths, tags }), { status: 200, headers: { 'content-type': 'application/json' } });
        }
        catch (error) {
            console.log('Error revalidating', paths, tags);
            console.error(error);
            return new Response(JSON.stringify({ ...response, paths, tags, error }), { status: 200, headers: { 'content-type': 'application/json' } });
        }
    });
}
const parseDelay = (entity) => {
    const updated_at = entity.meta?.updated_at ?? entity.attributes?.updated_at ?? null;
    const published_at = entity.meta?.published_at ?? entity.attributes?.published_at ?? null;
    const created_at = entity.meta?.created_at ?? entity.attributes?.created_at ?? null;
    if (!updated_at && !published_at && !created_at)
        return 0;
    return Date.now() - Math.max(new Date(updated_at).getTime(), new Date(published_at).getTime(), new Date(created_at).getTime());
};
//# sourceMappingURL=revalidate.js.map