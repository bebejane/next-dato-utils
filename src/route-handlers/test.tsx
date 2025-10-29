import {
	PluginAttributes,
	SiteAttributes,
	WebhookAttributes,
} from '@datocms/cma-client/dist/types/generated/RawApiTypes.js';
import basicAuth from './basic-auth.js';
import { Client, buildClient } from '@datocms/cma-client';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

const client = buildClient({
	apiToken: process.env.DATOCMS_API_TOKEN,
	environment: process.env.DATOCMS_ENVIRONMENT || 'main',
});

const baseApiUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api`;
type PreviewLink = {
	label: string;
	url: string;
};

type RevalidateResponse = {
	revalidated: boolean;
	paths: string[];
	delays: number;
	event_type: string;
};

type Model = {
	model: string;
	previews?: PreviewLink[];
	revalidate?: RevalidateResponse;
};

type TestResult = {
	site: SiteAttributes;
	plugins: PluginAttributes[];
	webhooks: WebhookAttributes[];
	models: Model[];
};

export default async function test(req: Request): Promise<Response> {
	return await basicAuth(req, async (req: Request) => {
		const params = new URLSearchParams(req.url.split('?')[1]);

		const results: TestResult = {
			site: await client.site.find(),
			webhooks: await client.webhooks.list(),
			plugins: await client.plugins.list(),
			models: await testApiEndpoints(params.get('locale') || params.get('l') || 'en'),
		};

		return new Response(renderToStaticMarkup(renderTestResults(results)), {
			status: 200,
			headers: { 'Content-Type': 'text/html; charset=utf-8' },
		});
	});
}

export const renderTestResults = (results: TestResult) => {
	return (
		<html>
			<head>
				<style>
					{`
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
						border-bottom: 1px solid #eee;
          }
					hr{
						width:100%;
						background-color: #eee;
						margin-bottom:1rem;
					}
          .center{
            text-align:center;
          }
          .error{
            color:red;
          }`}
				</style>
				<title>DatoCMS Test</title>
			</head>
			<body>
				<div className='right'>
					<section>
						<h3>Endpoints</h3>
						<hr />
						<table>
							<tbody>
								<thead>
									<tr>
										<th>Model</th>
										<th>Previews</th>
										<th>Revalidate</th>
									</tr>
								</thead>
								{results.models.map((r, idx) => (
									<tr key={idx}>
										<td className={!r.previews || !r.revalidate?.revalidated ? 'error' : ''}>{r.model}</td>
										<td>
											{r.previews
												?.filter(({ label, url }) => label === 'Live' && new URL(url).pathname)
												.map((p) => new URL(p.url).pathname)
												.map((p, i) => (
													<React.Fragment key={i}>
														<span title={p}>{p}</span>
														<br />
													</React.Fragment>
												))}
										</td>
										<td>
											{r.revalidate?.paths?.map((p, i) => (
												<React.Fragment key={i}>
													<span title={p}>{p}</span>
													<br />
												</React.Fragment>
											))}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</section>
				</div>

				<div className='left'>
					<section>
						<h3>Config</h3>
						<hr />
						<strong>Name:</strong> {results.site?.name}
						<br />
						<strong>Locales:</strong> {results.site?.locales.join(', ')}
						<br />
						<strong>Domain:</strong>{' '}
						<a href={`https://${results.site.internal_domain as string}`} target='_blank'>
							{results.site?.internal_domain}
						</a>
						<br />
						<strong>SEO</strong>
						<ul>
							<li>Site name: {results.site?.global_seo?.site_name}</li>
							<li>Title: {results.site?.global_seo?.fallback_seo?.title}</li>
							<li>Description: {results.site?.global_seo?.fallback_seo?.description}</li>
							<li>Image: {results.site?.global_seo?.fallback_seo?.image}</li>
						</ul>
					</section>
					<section>
						<h3>Webhooks</h3>
						<ul>
							{results.webhooks.map((p, i) => (
								<li key={i}>
									{p.name}: {p.url}
								</li>
							))}
						</ul>
					</section>
					<section>
						<h3>Plugins</h3>
						<ul>
							{results.plugins.map((p, i) => (
								<li key={i}>{p.name}</li>
							))}
						</ul>
					</section>
				</div>
			</body>
		</html>
	);
};

export async function testApiEndpoints(locale: string) {
	const site = await client.site.find();

	const itemTypes = await client.itemTypes.list();
	const models = itemTypes.filter((t) => !t.modular_block);

	console.log(`Testing site: ${site.name} with ${models.length} models`);

	const results = await Promise.all(
		models.map(async (model, i) => {
			const r: Model = {
				model: model.api_key,
			};

			try {
				const previews = await testWebPreviewsEndpoint(model, client, locale);
				if (previews.length > 0) {
					r.previews = previews;
				}
			} catch (e) {}

			try {
				r.revalidate = await testRevalidateEndpoint(model, client, locale);
			} catch (e) {}

			return r;
		})
	);

	return results.sort((a, b) => (a.model > b.model ? 1 : -1));
}

const testWebPreviewsEndpoint = async (itemType: any, client: Client, locale: string): Promise<PreviewLink[]> => {
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

const testRevalidateEndpoint = async (itemType: any, client: Client, locale: string): Promise<RevalidateResponse> => {
	const item = (
		await client.items.list({
			filter: { type: itemType.api_key },
			version: 'published',
			limit: 1,
		})
	)?.[0];
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
	} else {
		throw new Error(`Error testing revalidate endpoint: ${res.status} ${res.statusText}`);
	}
};
