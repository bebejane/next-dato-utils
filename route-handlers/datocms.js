import { backup, revalidate, test, webPreviews, draft } from '../route-handlers';
export default async (req, { params }, config) => {
    const { slug } = await params;
    return {
        POST: async (req) => {
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
        },
        GET: async (req) => {
            switch (slug) {
                case 'test':
                    return test(req);
                case 'draft':
                    return draft(req);
                default:
                    return new Response('Not Found', { status: 404 });
            }
        }
    };
};
//# sourceMappingURL=datocms.js.map