import { revalidatePath, revalidateTag } from 'next/cache.js';
//import basicAuth from "./basic-auth";
export default async function revalidate(req, callback) {
    const payload = await req.json();
    if (!payload || !payload?.entity)
        return new Response('Payload empty or missing entity', { status: 400 });
    const { entity, related_entities, event_type, entity_type } = payload;
    const api_key = related_entities.find(({ id }) => id === entity.relationships?.item_type?.data?.id)?.attributes?.api_key;
    const delay = Date.now() - Math.max(new Date(entity.meta.updated_at).getTime(), new Date(entity.meta.published_at).getTime(), new Date(entity.meta.created_at).getTime());
    const now = Date.now();
    const response = { revalidated: false, event_type, entity_type, api_key, delay, now };
    const transformedPayload = { entity, event_type, entity_type, api_key };
    return await callback(transformedPayload, async (paths, tags) => {
        try {
            if ((!paths && !tags) || (!paths.length && !tags.length))
                return new Response(JSON.stringify(response), { status: 200, headers: { 'content-type': 'application/json' } });
            paths?.forEach(p => revalidatePath(p));
            tags?.forEach(t => revalidateTag(t));
            return new Response(JSON.stringify({ ...response, revalidated: true, paths, tags }), { status: 200, headers: { 'content-type': 'application/json' } });
        }
        catch (error) {
            console.log('Error revalidating', paths, tags);
            console.error(error);
            return new Response(JSON.stringify({ ...response, paths, tags, error }), { status: 200, headers: { 'content-type': 'application/json' } });
        }
    });
}
//# sourceMappingURL=revalidate.js.map