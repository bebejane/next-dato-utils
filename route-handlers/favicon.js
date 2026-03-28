import { buildClient } from "@datocms/cma-client";
import { encodeIco } from 'ico-utils';
export default async function favicon(req) {
    const notfound = new Response('Not found', { status: 404 });
    try {
        const apiToken = process.env.NEXT_PUBLIC_DATOCMS_API_TOKEN ?? process.env.DATOCMS_API_TOKEN;
        if (!apiToken)
            throw new Error('No apiToken found');
        const client = buildClient({ apiToken });
        const { favicon } = await client.site.find();
        const upload = await client.uploads.find(favicon);
        if (!upload)
            throw new Error('Not found');
        const buffer = await (await fetch(`${upload.url}?w=128&h=128&fit=crop&q=100`)).arrayBuffer();
        if (!buffer)
            throw new Error('Not found');
        const icoBuffer = await encodeIco([buffer]);
        return new Response(icoBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/x-icon',
            },
        });
    }
    catch (err) {
        console.log('error', err);
        return notfound;
    }
}
//# sourceMappingURL=favicon.js.map