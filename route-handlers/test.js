import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import basicAuth from './basic-auth.js';
import { buildClient } from '@datocms/cma-client';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadConfig } from '../config/utils.js';
import React from 'react';
import { testAllEndpoints } from '../tests/endpoints.js';
const client = buildClient({
    apiToken: process.env.DATOCMS_API_TOKEN,
    environment: process.env.DATOCMS_ENVIRONMENT || 'main',
});
export default async function test(req) {
    return await basicAuth(req, async (req) => {
        const params = new URLSearchParams(req.url.split('?')[1]);
        let config = null;
        try {
            config = await loadConfig();
        }
        catch (e) { }
        const results = {
            site: await client.site.find(),
            webhooks: await client.webhooks.list(),
            plugins: await client.plugins.list(),
            endpoints: await testAllEndpoints(params.get('locale') || params.get('l') || config?.i18n?.defaultLocale || 'en'),
        };
        return new Response(renderToStaticMarkup(renderTestResults(results)), {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
    });
}
export const renderTestResults = (results) => {
    return (_jsxs("html", { children: [_jsxs("head", { children: [_jsx("style", { children: `
					:root{
						--gray:#cdcbcb;
					}
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
						max-width:400px;
						overflow:hidden;
						text-overflow:ellipsis;
						border-bottom: 1px solid var(--gray);
          }
					td{
						padding-right:2rem;	
					}
					hr{
						width:100%;
						background-color: var(--gray);
						margin-bottom:1rem;
					}
          .center{
            text-align:center;
          }
          .error{
            color:red;
          }` }), _jsx("title", { children: "DatoCMS Test" })] }), _jsxs("body", { children: [_jsx("div", { className: 'right', children: _jsxs("section", { children: [_jsx("h3", { children: "Endpoints" }), _jsx("hr", {}), _jsx("table", { children: _jsxs("tbody", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Model" }), _jsx("th", { children: "Previews" }), _jsx("th", { children: "Revalidate" })] }) }), results.endpoints.map(({ preview, revalidate }, idx) => (_jsxs("tr", { children: [_jsx("td", { className: !preview || !revalidate?.revalidated ? 'error' : '', children: preview?.api_key }), _jsx("td", { children: preview.links
                                                            ?.filter(({ label, url }) => label === 'Live' && new URL(url).pathname)
                                                            .map((p) => new URL(p.url).pathname)
                                                            .map((p, i) => (_jsxs(React.Fragment, { children: [_jsx("span", { title: p, children: p }), _jsx("br", {})] }, i))) }), _jsx("td", { children: revalidate?.paths?.map((p, i) => (_jsxs(React.Fragment, { children: [_jsx("span", { title: p, children: p }), _jsx("br", {})] }, i))) })] }, idx)))] }) })] }) }), _jsxs("div", { className: 'left', children: [_jsxs("section", { children: [_jsx("h3", { children: "Config" }), _jsx("hr", {}), _jsx("strong", { children: "Name:" }), " ", results.site?.name, _jsx("br", {}), _jsx("strong", { children: "Locales:" }), " ", results.site?.locales.join(', '), _jsx("br", {}), _jsx("strong", { children: "Domain:" }), ' ', _jsxs("a", { href: `https://${results.site.internal_domain}`, target: '_blank', children: ["https://", results.site?.internal_domain] }), _jsx("br", {}), _jsx("strong", { children: "SEO" }), _jsx("br", {}), results.site?.locales.map((locale) => {
                                        const isMultiLocale = results.site?.locales.length > 1;
                                        const seo = isMultiLocale
                                            ? results.site?.global_seo?.[locale]
                                            : results.site?.global_seo;
                                        return (_jsxs(React.Fragment, { children: [_jsxs("strong", { children: ["Locale: ", locale] }), _jsxs("ul", { children: [_jsxs("li", { children: ["Site name: ", seo?.site_name] }), _jsxs("li", { children: ["Title: ", seo?.fallback_seo?.title] }), _jsxs("li", { children: ["Description: ", seo?.fallback_seo?.description] }), _jsxs("li", { children: ["Image: ", seo?.fallback_seo?.image] })] }, locale)] }, locale));
                                    })] }), _jsxs("section", { children: [_jsx("h3", { children: "Webhooks" }), _jsx("ul", { children: results.webhooks.map((p, i) => (_jsxs("li", { children: [p.name, ": ", p.url] }, i))) })] }), _jsxs("section", { children: [_jsx("h3", { children: "Plugins" }), _jsx("ul", { children: results.plugins.map((p, i) => (_jsx("li", { children: p.name }, i))) })] })] })] })] }));
};
//# sourceMappingURL=test.js.map