import { draftMode } from 'next/headers.js';
import { print } from 'graphql/language/printer.js';
import { traverse } from 'object-traversal';
import isInteger from 'is-integer';
const defaultOptions = {
    variables: undefined,
    includeDrafts: false,
    excludeInvalid: true,
    visualEditingBaseUrl: undefined,
    revalidate: isInteger(process.env.REVALIDATE_TIME) ? parseInt(process.env.REVALIDATE_TIME) : 3600,
    tags: undefined,
    generateTags: false,
    maxTags: 64,
    logs: false,
    all: false
};
export default async function apiQuery(query, options) {
    const opt = { ...defaultOptions, ...(options ?? {}) };
    opt.generateTags = process.env.NEXT_DATO_UTILS_DISABLE_TAGS ? false : opt.generateTags;
    opt.logs = process.env.NEXT_DATO_UTILS_ENABLE_LOGS ? true : opt.logs;
    if (!process.env.DATOCMS_API_TOKEN && !process.env.NEXT_PUBLIC_DATOCMS_API_TOKEN)
        throw new Error('DATOCMS_API_TOKEN is not set');
    if (!process.env.DATOCMS_ENVIRONMENT && !process.env.NEXT_PUBLIC_DATOCMS_ENVIRONMENT)
        throw new Error('DATOCMS_ENVIRONMENT is not set');
    const queryId = (query.definitions?.[0]).name?.value;
    if (typeof options?.includeDrafts === 'undefined')
        try {
            opt.includeDrafts = (await draftMode()).isEnabled;
        }
        catch (e) { }
    const dedupeOptions = {
        body: JSON.stringify({ query: print(query), variables: options?.variables }),
        ...opt,
        queryId
    };
    const tags = opt.generateTags ? generateIdTags(await dedupedFetch(dedupeOptions), opt.tags, opt.maxTags) : opt.tags;
    const res = opt.includeDrafts ? await dedupedFetch({ ...dedupeOptions, tags, url: 'https://graphql-listen.datocms.com/preview' }) : {};
    opt.logs && console.log('[api-query]', 'calling', queryId);
    const { data } = await dedupedFetch({ ...dedupeOptions, tags });
    if (opt.all) {
        const paginatedData = await paginatedQuery(query, opt, data, queryId);
        return { ...paginatedData, draftUrl: res.url ?? null };
    }
    return { ...data, draftUrl: res.url ?? null };
}
const paginatedQuery = async (query, options, data, queryId) => {
    try {
        if (typeof data !== 'object' || data === null || data === undefined)
            throw new Error('Data must be an object');
        const operation = query.definitions?.find(({ kind }) => kind === 'OperationDefinition');
        if (!operation)
            throw new Error('Query must have an operation definition');
        const firstVariable = operation.variableDefinitions?.find(v => v.variable.name.value === 'first');
        const skipVariable = operation.variableDefinitions?.find(v => v.variable.name.value === 'skip');
        if (!firstVariable || !skipVariable)
            throw new Error(`Query must have first and skip variables`);
        const pageKeys = Object.keys(data).filter(k => k.startsWith('_all') && k.endsWith('Meta'));
        if (pageKeys.length === 0)
            throw new Error('Query must have at least one paginated field');
        const pageKeyMap = pageKeys.reduce((acc, cur) => {
            acc[cur] = `${cur.substring(1, cur.length - 'Meta'.length)}`;
            return acc;
        }, {});
        // Check filter diff
        Object.keys(pageKeyMap).forEach(k => {
            const filter = operation.selectionSet.selections.find(s => s.name.value === k)?.arguments?.find(a => a.name.value === 'filter');
            const metaFilter = operation.selectionSet.selections.find(s => s.name.value === pageKeyMap[k])?.arguments?.find(a => a.name.value === 'filter');
            if ((!filter && metaFilter) || (filter && !metaFilter) || JSON.stringify(filter) !== JSON.stringify(metaFilter))
                throw new Error(`Query must have same filter argument on ${k} and ${pageKeyMap[k]}`);
        });
        const first = options.variables?.first ?? firstVariable?.defaultValue?.value ?? 500;
        if (first > 500)
            throw new Error('"first" variable must be less than or equal to 500');
        let count = 0;
        while (Object.keys(pageKeyMap).some(k => data[k].count > data[pageKeyMap[k]].length)) {
            const maxPageKey = pageKeyMap[Object.keys(pageKeyMap).sort((a, b) => data[a].count > data[b].count ? -1 : 1)[0]];
            const skip = data[maxPageKey].length;
            const pageData = await apiQuery(query, {
                ...options,
                all: false,
                variables: {
                    ...options.variables,
                    first,
                    skip
                }
            });
            Object.keys(pageKeyMap).forEach(k => data[pageKeyMap[k]] = [...data[pageKeyMap[k]], ...pageData[pageKeyMap[k]]]);
            if (++count > 1000) {
                throw new Error('Paginated query exceeded 1000 requests');
            }
        }
        return data;
    }
    catch (e) {
        throw new Error(`${queryId}: ${e.message}`);
    }
};
const dedupedFetch = async (options) => {
    const { url, body, includeDrafts, excludeInvalid, visualEditingBaseUrl, revalidate, tags, queryId, logs } = options;
    const headers = {
        'Authorization': `Bearer ${process.env.DATOCMS_API_TOKEN ?? process.env.NEXT_PUBLIC_DATOCMS_API_TOKEN}`,
        ...(includeDrafts ? { 'X-Include-Drafts': 'true' } : {}),
        ...(excludeInvalid ? { 'X-Exclude-Invalid': 'true' } : {}),
        ...(visualEditingBaseUrl
            ? {
                'X-Visual-Editing': 'vercel-v1',
                'X-Base-Editing-Url': visualEditingBaseUrl,
            }
            : {}),
        ...(process.env.DATOCMS_ENVIRONMENT
            ? { 'X-Environment': process.env.DATOCMS_ENVIRONMENT ?? process.env.NEXT_PUBLIC_DATOCMS_ENVIRONMENT }
            : {}),
    };
    const response = await fetch(url ?? 'https://graphql.datocms.com/', {
        method: 'POST',
        headers,
        body,
        next: {
            revalidate,
            tags: Array.isArray(tags) ? tags : undefined
        }
    });
    const responseBody = await response.json();
    if (!response.ok)
        throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(responseBody)}`);
    if (responseBody.errors)
        throw new Error(`${queryId}: ${responseBody.errors.map((e) => e.message).join('. ')}`);
    logs && console.log('[api-query]', queryId, { ...options, body: undefined }, `tags: ${tags?.length ?? 0}`, response.headers.get('x-cache'));
    return responseBody;
};
const generateIdTags = (data, tags, maxTags) => {
    const allTags = tags?.length ? tags : [];
    traverse(data, ({ key, value }) => key === 'id' && allTags.push(String(value)));
    const uniqueTags = allTags.filter((value, index, self) => self.indexOf(value) === index).filter(t => t);
    return uniqueTags.slice(0, maxTags);
};
//# sourceMappingURL=api-query.js.map