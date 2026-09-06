import path from 'path';
export default async function withDatoCms(config) {
    return {
        ...config,
        webpack: (c, context) => {
            c = config?.webpack ? config.webpack(c, context) : c;
            c.resolve.alias['datocms.config'] = path.join(__dirname, 'datocms.config.ts');
            return c;
        },
        turbopack: {
            ...config.turbopack,
            resolveAlias: {
                ...config.turbopack?.resolveAlias,
                'datocms.config': './datocms.config.ts',
            },
        },
        async headers() {
            return [
                {
                    source: '/api/web-previews',
                    headers: [
                        { key: 'Access-Control-Allow-Credentials', value: 'true' },
                        { key: 'Access-Control-Allow-Origin', value: '*' },
                        { key: 'Access-Control-Allow-Methods', value: 'POST,OPTIONS' },
                        {
                            key: 'Access-Control-Allow-Headers',
                            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
                        },
                    ],
                },
                {
                    source: '/api/backup',
                    headers: [
                        { key: 'Access-Control-Allow-Credentials', value: 'true' },
                        { key: 'Access-Control-Allow-Origin', value: '*' }, // replace this your actual origin
                        { key: 'Access-Control-Allow-Methods', value: 'POST,OPTIONS' },
                        {
                            key: 'Access-Control-Allow-Headers',
                            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
                        },
                    ],
                },
            ];
        },
    };
}
//# sourceMappingURL=with-datocms.js.map