import { backup, revalidate, test, webPreviews, draft } from '../route-handlers';
const POST = async (req, { params }, config) => {
    const { slug } = await params;
    try {
        switch (slug) {
            case 'revalidate':
                return revalidate(req, async (payload, revalidate) => {
                    const { api_key, entity } = payload;
                    const { id, attributes } = entity;
                    if (!api_key)
                        throw new Error('No api_key found');
                    const paths = await config.routes?.[api_key]?.(attributes) ?? [];
                    const tags = [api_key, id].filter(t => t);
                    return await revalidate(paths, tags, true);
                });
            case 'web-previews':
                return webPreviews(req, async ({ item, itemType, locale }) => {
                    const path = await config.routes[itemType.attributes.api_key]?.(item, locale);
                    return path?.[0] ?? null;
                });
            case 'backup':
                return backup(req);
            default:
                return new Response('Not Found', { status: 404 });
        }
    }
    catch (e) {
        return new Response(e.message, { status: 500 });
    }
};
const GET = async (req, { params }, config) => {
    try {
        const { slug } = await params;
        switch (slug) {
            case 'test':
                return test(req);
            case 'draft':
                return draft(req);
            case 'config':
                return new Response(JSON.stringify(config), { status: 200, headers: { 'Content-Type': 'application/json' } });
            default:
                return new Response('Not Found', { status: 404 });
        }
    }
    catch (e) {
        return new Response(e.message, { status: 500 });
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
};
export default router;
//# sourceMappingURL=router.js.map