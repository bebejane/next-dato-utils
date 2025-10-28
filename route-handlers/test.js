import basicAuth from './basic-auth.js';
import { buildClient } from '@datocms/cma-client-browser';
const tests = async (req) => {
    return await basicAuth(req, async (req) => {
        const params = new URLSearchParams(req.url.split('?')[1]);
        const results = await testApiEndpoints(params.get('locale') || params.get('l') || 'en');
        if (params.get('json'))
            return new Response(JSON.stringify(results), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        else
            return new Response(testResultsToHtml(results), {
                status: 200,
                headers: { 'Content-Type': 'text/html' },
            });
    });
};
export default tests;
const baseApiUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api`;
export async function testApiEndpoints(locale) {
    const client = buildClient({
        apiToken: process.env.DATOCMS_API_TOKEN,
        environment: process.env.DATOCMS_ENVIRONMENT || 'main',
    });
    const site = await client.site.find();
    console.log(`Testing site: ${site.name}`);
    const itemTypes = await client.itemTypes.list();
    const models = itemTypes.filter((t) => !t.modular_block);
    const results = await Promise.all(models.map(async (model, i) => {
        const r = { model: model.api_key };
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
export const testResultsToString = (results) => {
    const tests = results
        .map((r) => {
        return `${r.model} - Previews: ${r.previews ? 'YES' : 'NO'} / Revalidate: ${r.revalidate ? 'YES' : 'NO'}`;
    })
        .join('\n');
    const previews = results
        .filter((r) => r.previews)
        .map((r) => r.model)
        .sort((a, b) => (a > b ? 1 : -1))
        .join('\n');
    const revalidate = results
        .filter((r) => r.revalidate?.paths.length)
        .map((r) => r.model)
        .sort((a, b) => (a > b ? 1 : -1))
        .join('\n');
    const nopreviews = results
        .filter((r) => !r.previews)
        .map((r) => r.model)
        .sort((a, b) => (a > b ? 1 : -1))
        .join('\n');
    const norevalidate = results
        .filter((r) => !r.revalidate || !r.revalidate?.paths.length)
        .map((r) => r.model)
        .sort((a, b) => (a > b ? 1 : -1))
        .join('\n');
    return `WEB PREVIEWS\n${previews}\n\nNO WEB PREVIEWS:\n${nopreviews}\n\nREVALIDATE\n${revalidate}\n\nNO REVALIDATE\n${norevalidate}`;
};
export const testResultsToHtml = (results) => {
    console.log('TEST API');
    console.log(JSON.stringify(results, null, 2));
    return `
    <html>
      <head>
        <style>
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
          }
        </style>
      </head>
      <body>
        <pre>
        <table>
          <thead>
            <tr>
              <th>Model</th>
              <th>Previews</th>
              <th>Revalidate</th> 
            </tr>
          </thead>
          <tbody>
            ${results
        .map((r) => `
              <tr>
                <td class="${!r.previews || !r.revalidate?.revalidated ? 'error' : ''}">${r.model}</td>
                <td>${r.previews
        ?.filter(({ label, url }) => label === 'Live' && new URL(url).pathname)
        .map((p) => new URL(p.url).pathname)
        .join('\n') ?? ''}</td>
                <td>${r.revalidate?.paths?.join('\n') ?? ''}</td>
              </tr>
            `)
        .join('')}
          </tbody>
        </pre>
      </body>
    </html>
  `;
};
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