import { backup, revalidate, test, webPreviews, draft } from '../route-handlers/index.js';
export const getDatoCmsConfig = async () => {
    const file = process.env.NODE_ENV === 'development' ? 'datocms.config.ts' : 'datocms.config.js';
    const path = '../../../' + file;
    console.log(path, process.env.NODE_ENV, process.cwd());
    const config = (await import(path)).default;
    return config;
};
export const getRoute = async (record, locale) => {
    const config = await getDatoCmsConfig();
    if (!config?.routes?.[record?.api_key])
        throw new Error(`No route found for ${record.api_key}`);
    return config.routes[record.api_key](record, locale);
};
export const datoCmsRouteHandler = async (req, { params }) => {
    const config = await getDatoCmsConfig();
    const { slug } = await params;
    let handler = null;
    switch (slug) {
        case 'revalidate':
            handler = () => revalidate(req, async (payload, revalidate) => {
                const { api_key, entity } = payload;
                const { id, attributes } = entity;
                if (!api_key)
                    throw new Error('No api_key found');
                const paths = await config.routes?.[api_key]?.(attributes) ?? [];
                const tags = [api_key, id].filter(t => t);
                return await revalidate(paths, tags, true);
            });
            break;
        case 'web-previews':
            handler = () => webPreviews(req, async ({ item, itemType, locale }) => {
                const path = await config.routes[itemType.attributes.api_key](item, locale);
                return path?.[0] ?? null;
            });
            break;
        case 'backup':
            handler = () => backup(req);
            break;
        case 'test':
            handler = () => test(req);
            break;
        case 'draft':
            handler = () => draft(req);
            break;
    }
    if (!handler)
        throw new Error(`No handler found for ${slug}`);
    return handler();
};
//# sourceMappingURL=index.js.map