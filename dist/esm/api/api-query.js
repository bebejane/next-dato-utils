'use server';
import { draftMode } from 'next/headers.js';
import { print } from 'graphql/language/printer.js';
import { cache } from 'react';
import { traverse } from 'object-traversal';
import isInteger from 'is-integer';
const defaultOptions = {
    variables: undefined,
    includeDrafts: false,
    excludeInvalid: true,
    visualEditingBaseUrl: undefined,
    revalidate: isInteger(process.env.REVALIDATE_TIME) ? parseInt(process.env.REVALIDATE_TIME) : 3600,
    tags: undefined,
    generateTags: true
};
export default async function apiQuery(query, options) {
    const opt = Object.assign(defaultOptions, options ?? {});
    if (!process.env.DATOCMS_API_TOKEN)
        throw new Error('DATOCMS_API_TOKEN is not set');
    if (!process.env.DATOCMS_ENVIRONMENT)
        throw new Error('DATOCMS_ENVIRONMENT is not set');
    const queryId = (query.definitions?.[0]).name?.value;
    let includeDrafts = opt.includeDrafts ?? false;
    if (typeof opt.includeDrafts === 'undefined')
        try {
            includeDrafts = draftMode().isEnabled;
        }
        catch (e) { }
    const dedupeOptions = {
        body: JSON.stringify({ query: print(query), variables: options?.variables }),
        ...opt,
        queryId
    };
    const tags = opt.generateTags ? generateIdTags(await dedupedFetch(dedupeOptions), opt.tags, queryId) : opt.tags;
    const res = includeDrafts ? await dedupedFetch({ ...dedupeOptions, tags, url: 'https://graphql-listen.datocms.com/preview' }) : {};
    const { data } = await dedupedFetch({ ...dedupeOptions, tags });
    return { ...data, draftUrl: res.url ?? null };
}
const dedupedFetch = cache(async (options) => {
    const { url, body, includeDrafts, excludeInvalid, visualEditingBaseUrl, revalidate, tags, queryId } = options;
    const headers = {
        'Authorization': `Bearer ${process.env.DATOCMS_API_TOKEN}`,
        ...(includeDrafts ? { 'X-Include-Drafts': 'true' } : {}),
        ...(excludeInvalid ? { 'X-Exclude-Invalid': 'true' } : {}),
        ...(visualEditingBaseUrl
            ? {
                'X-Visual-Editing': 'vercel-v1',
                'X-Base-Editing-Url': visualEditingBaseUrl,
            }
            : {}),
        ...(process.env.DATOCMS_ENVIRONMENT
            ? { 'X-Environment': process.env.DATOCMS_ENVIRONMENT }
            : {}),
    };
    const next = { revalidate };
    if (tags && tags?.length > 0)
        next['tags'] = tags;
    const response = await fetch(url ?? 'https://graphql.datocms.com/', {
        method: 'POST',
        headers,
        body,
        next,
    });
    const responseBody = await response.json();
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(responseBody)}`);
    }
    console.log(queryId, options);
    return responseBody;
});
const generateIdTags = (data, tags, queryId) => {
    const allTags = tags?.length ? tags : [];
    traverse(data, ({ key, value }) => key === 'id' && allTags.push(value));
    const uniqueTags = allTags.filter((value, index, self) => self.indexOf(value) === index).filter(t => t);
    return uniqueTags;
};
//# sourceMappingURL=api-query.js.map