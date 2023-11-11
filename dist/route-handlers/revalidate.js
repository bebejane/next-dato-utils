"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("next/cache");
//import basicAuth from "./basic-auth";
async function revalidate(req, callback) {
    const payload = await req.json();
    if (!payload || !payload?.entity)
        return new Response('Payload empty or missing entity', { status: 400 });
    const { entity, related_entities, event_type } = payload;
    const api_key = related_entities.find(({ id }) => id === entity.relationships?.item_type?.data?.id)?.attributes?.api_key;
    if (!api_key)
        return new Response('Model api_key not found in payload', { status: 400 });
    const transformedPayload = { entity, event_type, api_key };
    const delay = Date.now() - Math.max(new Date(entity.meta.updated_at).getTime(), new Date(entity.meta.published_at).getTime(), new Date(entity.meta.created_at).getTime());
    const now = Date.now();
    const response = { revalidated: false, event_type, api_key, delay, now };
    return await callback(transformedPayload, async (paths, tags) => {
        try {
            if ((!paths && !tags) || (!paths.length && !tags.length))
                return new Response(JSON.stringify(response), { status: 200, headers: { 'content-type': 'application/json' } });
            paths?.forEach(p => (0, cache_1.revalidatePath)(p));
            tags?.forEach(t => (0, cache_1.revalidateTag)(t));
            return new Response(JSON.stringify({ ...response, revalidated: true, paths, tags }), { status: 200, headers: { 'content-type': 'application/json' } });
        }
        catch (error) {
            console.log('Error revalidating', paths, tags);
            console.error(error);
            return new Response(JSON.stringify({ ...response, paths, tags, error }), { status: 200, headers: { 'content-type': 'application/json' } });
        }
    });
}
exports.default = revalidate;
//# sourceMappingURL=revalidate.js.map