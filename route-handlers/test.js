import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import basicAuth from './basic-auth.js';
import { buildClient } from '@datocms/cma-client';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
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
					html, body{
						font-family: sans-serif;
						color:#333;
						background:#f5f5f5;
					}
					body{
						display:flex;
						flex-direction:column;
					}
					section{
						margin-bottom:20px;
					}
					.left{
						
					}
					.right{
						
					}
					ul{
						list-style: none;
						padding:0;
						margin:0;
						padding-left:10px;
					}
					li{

					}
					h3{
						padding:0;
						margin:0;
						font-size:16px;
						font-weight:bold;
						margin-bottom:10px;
					}
          table {
            border-collapse: collapse;
            width: 400px;
          }
          th, td {
            padding: 5px;
						padding-left:0;
            text-align:left;
            vertical-align: top;
            white-space:pre;
						max-width:300px;
						overflow:hidden;
						text-overflow:ellipsis;
          }
					hr{
						widht:100%;
					}
          .center{
            text-align:center;
          }
          .error{
            color:red;
          }` }) }), _jsxs("body", { children: [_jsx("div", { className: 'right', children: _jsxs("section", { children: [_jsx("h3", { children: "Endpoints" }), _jsx("table", { children: _jsxs("tbody", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Model" }), _jsx("th", { children: "Previews" }), _jsx("th", { children: "Revalidate" })] }) }), results.models.map((r) => (_jsxs("tr", { children: [_jsx("td", { className: !r.previews || !r.revalidate?.revalidated ? 'error' : '', children: r.model }), _jsx("td", { children: r.previews
                                                            ?.filter(({ label, url }) => label === 'Live' && new URL(url).pathname)
                                                            .map((p) => new URL(p.url).pathname)
                                                            .map((p, i) => (_jsxs(React.Fragment, { children: [_jsx("span", { title: p, children: p }), _jsx("br", {})] }, i))) }), _jsx("td", { children: r.revalidate?.paths?.map((p, i) => (_jsxs(React.Fragment, { children: [_jsx("span", { title: p, children: p }), _jsx("br", {})] }, i))) })] })))] }) })] }) }), _jsx("hr", {}), _jsxs("div", { className: 'left', children: [_jsxs("section", { children: [_jsx("h3", { children: "Config" }), _jsx("strong", { children: "Name:" }), " ", results.site?.name, _jsx("br", {}), _jsx("strong", { children: "Locales:" }), " ", results.site?.locales.join(', '), _jsx("br", {}), _jsx("strong", { children: "Domain:" }), ' ', _jsx("a", { href: `https://${results.site.internal_domain}`, target: '_blank', children: results.site?.internal_domain }), _jsx("br", {}), _jsx("strong", { children: "SEO" }), _jsxs("ul", { children: [_jsxs("li", { children: ["Site name: ", results.site?.global_seo?.site_name] }), _jsxs("li", { children: ["Title: ", results.site?.global_seo?.fallback_seo?.title] }), _jsxs("li", { children: ["Description: ", results.site?.global_seo?.fallback_seo?.description] }), _jsxs("li", { children: ["Image: ", results.site?.global_seo?.fallback_seo?.image] })] })] }), _jsxs("section", { children: [_jsx("h3", { children: "Webhooks" }), _jsx("ul", { children: results.webhooks.map((p, i) => (_jsxs("li", { children: [p.name, ": ", p.url] }, i))) })] }), _jsxs("section", { children: [_jsx("h3", { children: "Plugins" }), _jsx("ul", { children: results.plugins.map((p, i) => (_jsx("li", { children: p.name }, i))) })] })] })] })] }));
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