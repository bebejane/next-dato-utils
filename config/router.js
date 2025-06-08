import { backup, revalidate, test, webPreviews, draft } from '../route-handlers';
const POST = async (req, { params }, config) => {
    const { route } = await params;
    try {
        switch (route) {
            case 'revalidate':
                return revalidate(req, async (payload, revalidate) => {
                    const { api_key, entity } = payload;
                    const { id, attributes } = entity;
                    if (!api_key)
                        throw new Error('No api_key found');
                    let paths = [];
                    const record = { ...attributes, id };
                    if (config.i18n) {
                        paths = (await config.routes?.[api_key]?.(record, config.i18n?.defaultLocale)) ?? [];
                        paths.forEach((path) => {
                            config.i18n?.locales
                                .filter((l) => l !== config.i18n?.defaultLocale)
                                .forEach((locale) => {
                                paths.push(path == '/' ? `/${locale}` : `/${locale}/${path}`);
                            });
                        });
                    }
                    else {
                        paths = (await config.routes?.[api_key]?.(record)) ?? [];
                    }
                    const tags = [api_key, id].filter((t) => t);
                    return await revalidate(paths, tags, true);
                });
            case 'web-previews':
                return webPreviews(req, async ({ item, itemType, locale }) => {
                    const paths = await config.routes[itemType.attributes.api_key]?.(item.attributes, locale);
                    return paths?.[0] ?? null;
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
        const { route } = await params;
        const searchParams = req.nextUrl.searchParams;
        switch (route) {
            case 'test':
                return test(req);
            case 'draft':
                return draft(req, searchParams);
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