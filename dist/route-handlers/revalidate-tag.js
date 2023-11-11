"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicAuth = void 0;
const cache_1 = require("next/cache");
async function revalidateTagHandler(req) {
    if (!(0, exports.basicAuth)(req))
        return new Response('unauthorized', { status: 401 });
    const payload = await req.json();
    if (!payload || !payload?.entity)
        return new Response('Payload empty or missing entity', { status: 400 });
    const { entity, event_type } = payload;
    const { id } = entity;
    const delay = Date.now() - Math.max(new Date(entity.meta.updated_at).getTime(), new Date(entity.meta.published_at).getTime(), new Date(entity.meta.created_at).getTime());
    const now = Date.now();
    (0, cache_1.revalidateTag)(id);
    console.log(`Revalidated tag (${event_type}): "${id}"`);
    return new Response(JSON.stringify({ revalidated: true, id, now, delay, event_type }), { status: 200, headers: { 'content-type': 'application/json' } });
}
exports.default = revalidateTagHandler;
const basicAuth = (req) => {
    if (!process.env.BASIC_AUTH_USER || !process.env.BASIC_AUTH_PASSWORD)
        throw new Error('BASIC_AUTH_USER or BASIC_AUTH_PASSWORD not set in .env');
    const basicAuth = req.headers.get('authorization');
    if (!basicAuth)
        return true;
    const auth = basicAuth.split(' ')[1];
    const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');
    return user === process.env.BASIC_AUTH_USER && pwd === process.env.BASIC_AUTH_PASSWORD;
};
exports.basicAuth = basicAuth;
//# sourceMappingURL=revalidate-tag.js.map