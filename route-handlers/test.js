import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import basicAuth from './basic-auth.js';
import { buildClient } from '@datocms/cma-client';
import { renderToStaticMarkup } from 'react-dom/server';
const client = buildClient({
    apiToken: process.env.DATOCMS_API_TOKEN,
    environment: process.env.DATOCMS_ENVIRONMENT || 'main',
});
const baseApiUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api`;
export default async function test(req) {
    return await basicAuth(req, async (req) => {
        const params = new URLSearchParams(req.url.split('?')[1]);
        const results = {
            site: await client.site.find(),
            webhooks: await client.webhooks.list(),
            plugins: await client.plugins.list(),
            models: await testApiEndpoints(params.get('locale') || params.get('l') || 'en'),
        };
        return new Response(renderToStaticMarkup(renderTestResults(results)), {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
        });
    });
}
export const renderTestResults = (results) => {
    return (_jsxs("html", { children: [_jsx("head", { children: _jsx("style", { children: `
          table {
            border-collapse: collapse;
            width: 400px;
          }
          th, td {
            padding: 5px;
            text-align:left;
            vertical-align: top;
            white-space:pre;
          }
          .center{
            text-align:center;
          }
          .error{
            color:red;
          }` }) }), _jsxs("body", { children: [_jsxs("section", { children: [_jsx("h3", { children: "Site" }), _jsxs("p", { children: [_jsx("strong", { children: "Name:" }), " ", results.site?.name, _jsx("br", {}), _jsx("strong", { children: "Locales:" }), " ", results.site?.locales, _jsx("br", {}), _jsx("strong", { children: "Domain:" }), ' ', _jsx("a", { href: results.site.internal_domain, children: results.site?.internal_domain }), _jsx("br", {})] })] }), _jsxs("section", { children: [_jsx("h3", { children: "Plugins" }), _jsx("ul", { children: results.plugins.map((p, i) => (_jsxs("li", { children: [_jsxs("strong", { children: [p.name, ": "] }), " ", p.package_version] }, i))) })] }), _jsxs("section", { children: [_jsx("h3", { children: "Endpoints" }), _jsx("table", { children: _jsxs("tbody", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Model" }), _jsx("th", { children: "Previews" }), _jsx("th", { children: "Revalidate" })] }) }), results.models.map((r) => (_jsxs("tr", { children: [_jsx("td", { className: !r.previews || !r.revalidate?.revalidated ? 'error' : '', children: r.model }), _jsx("td", { children: r.previews
                                                        ?.filter(({ label, url }) => label === 'Live' && new URL(url).pathname)
                                                        .map((p) => new URL(p.url).pathname)
                                                        .join('\n') ?? '' }), _jsx("td", { children: r.revalidate?.paths?.join('\n') ?? '' })] })))] }) })] })] })] }));
};
export async function testApiEndpoints(locale) {
    const site = await client.site.find();
    console.log(`Testing site: ${site.name}`);
    const itemTypes = await client.itemTypes.list();
    const models = itemTypes.filter((t) => !t.modular_block);
    const results = await Promise.all(models.map(async (model, i) => {
        const r = {
            model: model.api_key,
        };
        console.log(`${i + 1}/${models.length}: ${r.model}`);
        try {
            const previews = await testWebPreviewsEndpoint(model, client, locale);
            if (previews.length > 0) {
                r.previews = previews;
            }
        }
        catch (e) { }
        try {
            r.revalidate = await testRevalidateEndpoint(model, client, locale);
        }
        catch (e) { }
        return r;
    }));
    return results.sort((a, b) => (a.model > b.model ? 1 : -1));
}
const testWebPreviewsEndpoint = async (itemType, client, locale) => {
    const items = await client.items.list({
        limit: 1,
        version: 'published',
        nested: true,
        filter: { type: itemType.api_key },
    });
    const item = items[0];
    const res = await fetch(`${baseApiUrl}/web-previews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${process.env.BASIC_AUTH_USER}:${process.env.BASIC_AUTH_PASSWORD}`)}`,
        },
        body: JSON.stringify({
            item: {
                attributes: item || {},
            },
            itemType: {
                attributes: itemType,
            },
            environmentId: process.env.DATOCMS_ENVIRONMENT || 'main',
            locale,
        }),
    });
    const json = await res.json();
    return json.previewLinks;
};
const testRevalidateEndpoint = async (itemType, client, locale) => {
    const item = (await client.items.list({
        filter: { type: itemType.api_key },
        version: 'published',
        limit: 1,
    }))?.[0];
    const res = await fetch(`${baseApiUrl}/revalidate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${process.env.BASIC_AUTH_USER}:${process.env.BASIC_AUTH_PASSWORD}`)}`,
        },
        body: JSON.stringify({
            locale: locale,
            environment: process.env.DATOCMS_ENVIRONMENT || 'main',
            entity_type: 'item',
            event_type: 'update',
            entity: {
                id: item.id,
                type: 'item',
                attributes: {
                    ...(item || {}),
                },
                relationships: {
                    item_type: {
                        data: {
                            id: itemType.id,
                            type: 'item_type',
                        },
                    },
                },
                meta: {
                    ...item.meta,
                    updated_at: new Date().toISOString(),
                    published_at: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                },
            },
            related_entities: [
                {
                    id: itemType.id,
                    type: 'item_type',
                    attributes: itemType,
                },
            ],
        }),
    });
    if (res.status === 200) {
        const json = await res.json();
        return json.response;
    }
    else {
        throw new Error(`Error testing revalidate endpoint: ${res.status} ${res.statusText}`);
    }
};
//# sourceMappingURL=test.js.map