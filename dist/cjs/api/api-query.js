"use strict";
'use server';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const headers_js_1 = require("next/headers.js");
const printer_js_1 = require("graphql/language/printer.js");
const react_1 = require("react");
const is_integer_1 = __importDefault(require("is-integer"));
const defaultOptions = {
    variables: undefined,
    includeDrafts: false,
    excludeInvalid: true,
    visualEditingBaseUrl: undefined,
    revalidate: (0, is_integer_1.default)(process.env.REVALIDATE_TIME) ? parseInt(process.env.REVALIDATE_TIME) : 3600,
    tags: undefined,
    generateTags: true
};
async function apiQuery(query, options) {
    const opt = Object.assign(defaultOptions, options ?? {});
    if (!process.env.DATOCMS_API_TOKEN)
        throw new Error('DATOCMS_API_TOKEN is not set');
    if (!process.env.DATOCMS_ENVIRONMENT)
        throw new Error('DATOCMS_ENVIRONMENT is not set');
    const queryId = (query.definitions?.[0]).name?.value;
    let includeDrafts = opt.includeDrafts ?? false;
    if (typeof opt.includeDrafts === 'undefined')
        try {
            includeDrafts = (0, headers_js_1.draftMode)().isEnabled;
        }
        catch (e) { }
    const dedupeOptions = {
        body: JSON.stringify({ query: (0, printer_js_1.print)(query), variables: options?.variables }),
        ...opt,
        queryId
    };
    console.log(dedupeOptions);
    const tags = opt.generateTags ? generateIdTags(await dedupedFetch(dedupeOptions), opt.tags, queryId) : opt.tags;
    const res = includeDrafts ? await dedupedFetch({ ...dedupeOptions, url: 'https://graphql-listen.datocms.com/preview' }) : {};
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
    console.log(queryId, tags, idTags);
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