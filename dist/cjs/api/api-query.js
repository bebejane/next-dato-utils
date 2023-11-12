"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const react_1 = require("react");
async function apiQuery(query, options) {
    options = options ?? {};
    if (!process.env.DATOCMS_API_TOKEN)
        throw new Error('DATOCMS_API_TOKEN is not set');
    if (!process.env.DATOCMS_ENVIRONMENT)
        throw new Error('DATOCMS_ENVIRONMENT is not set');
    const queryId = (query.definitions?.[0]).name?.value;
    const revalidate = options?.includeDrafts ? 0 : typeof options?.revalidate === 'number' ? options.revalidate : parseInt(process.env.REVALIDATE_TIME) ?? 3600;
    const dedupeOptions = {
        body: JSON.stringify({ query: (0, graphql_1.print)(query), variables: options?.variables }),
        includeDrafts: options.includeDrafts ?? false,
        excludeInvalid: options.excludeInvalid ?? true,
        visualEditingBaseUrl: options.visualEditingBaseUrl ?? undefined,
        revalidate,
        tags: options.tags ?? undefined,
        queryId
    };
    const tags = options.generateTags ? generateIdTags(await dedupedFetch(dedupeOptions), options.tags ?? null, queryId) : options.tags;
    const res = options.includeDrafts ? await dedupedFetch({ ...dedupeOptions, url: 'https://graphql-listen.datocms.com/preview' }) : {};
    const { data } = await dedupedFetch({ ...dedupeOptions, tags });
    return { ...data, draftUrl: res.url ?? null };
}
exports.default = apiQuery;
const dedupedFetch = (0, react_1.cache)(async (options) => {
    const { url, body, includeDrafts, excludeInvalid, visualEditingBaseUrl, revalidate, tags } = options;
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
    const next = {};
    if (revalidate !== null)
        next['revalidate'] = revalidate;
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
    return responseBody;
});
const generateIdTags = (data, tags, queryId) => {
    const allTags = [];
    iterateObject(data, (key, value) => {
        key === 'id' && allTags.push(value);
        return true;
    });
    tags?.length && allTags.push.apply(allTags, tags);
    const idTags = allTags.filter((value, index, self) => self.indexOf(value) === index); // dedupe
    console.log('idTags', queryId, idTags);
    return idTags;
};
const iterateObject = (obj, fn) => {
    let i = 0, keys = [];
    if (Array.isArray(obj)) {
        for (; i < obj.length; ++i) {
            if (fn(obj[i], i, obj) === false)
                break;
        }
    }
    else if (typeof obj === "object" && obj !== null) {
        keys = Object.keys(obj);
        for (; i < keys.length; ++i) {
            if (fn(obj[keys[i]], keys[i], obj) === false)
                break;
        }
    }
};
//# sourceMappingURL=api-query.js.map