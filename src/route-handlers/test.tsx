import {
	PluginAttributes,
	SiteAttributes,
	WebhookAttributes,
} from '@datocms/cma-client/dist/types/generated/RawApiTypes.js';
import basicAuth from './basic-auth.js';
import { buildClient } from '@datocms/cma-client';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadConfig } from '../config/utils.js';
import React from 'react';
import { DatoCmsConfig } from '../config/config.js';
import { RevalidateResult, testAllEndpoints, WebPreviewResult } from '../tests/endpoints.js';

const client = buildClient({
	apiToken: process.env.DATOCMS_API_TOKEN,
	environment: process.env.DATOCMS_ENVIRONMENT || 'main',
});

type TestResult = {
	site: SiteAttributes;
	plugins: PluginAttributes[];
	webhooks: WebhookAttributes[];
	endpoints: { revalidate: RevalidateResult; preview: WebPreviewResult }[];
};

export default async function test(req: Request): Promise<Response> {
	return await basicAuth(req, async (req: Request) => {
		const params = new URLSearchParams(req.url.split('?')[1]);
		let config: DatoCmsConfig | null = null;
		try {
			config = await loadConfig();
		} catch (e) {}

		const results: TestResult = {
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

export const renderTestResults = (results: TestResult) => {
	return (
		<html>
			<head>
				<style>
					{`
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
										<th>Item</th>
									</tr>
								</thead>
								{results.endpoints.map(({ preview, revalidate }, idx) => (
									<tr key={idx}>
										<td className={!preview || !revalidate?.revalidated ? 'error' : ''}>{preview?.api_key}</td>
										<td>
											{preview?.links
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
											{revalidate?.paths?.map((p, i) => (
												<React.Fragment key={i}>
													<span title={p}>{p}</span>
													<br />
												</React.Fragment>
											))}
										</td>
										<td>
											{preview?.item?.id && results.site?.domain && (
												<a
													href={`https://${results.site?.domain}editor/item_types/${preview.item.item_type?.id}/items/${preview.item.id}`}
													target='_blank'
												>
													{preview?.item?.id}
												</a>
											)}
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
							https://{results.site?.internal_domain}
						</a>
						<br />
						<strong>SEO</strong>
						<br />
						{results.site?.locales.map((locale) => {
							const isMultiLocale = results.site?.locales.length > 1;
							const seo = isMultiLocale
								? (results.site?.global_seo?.[locale] as SiteAttributes['global_seo'])
								: results.site?.global_seo;
							return (
								<React.Fragment key={locale}>
									<strong>Locale: {locale}</strong>
									<ul key={locale}>
										<li>Site name: {seo?.site_name}</li>
										<li>Title: {seo?.fallback_seo?.title}</li>
										<li>Description: {seo?.fallback_seo?.description}</li>
										<li>Image: {seo?.fallback_seo?.image}</li>
									</ul>
								</React.Fragment>
							);
						})}
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
