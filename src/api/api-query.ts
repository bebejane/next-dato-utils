'use server'

import { draftMode } from 'next/headers.js'
import type { RequestInit } from 'next/dist/server/web/spec-extension/request.js'
import type { DocumentNode, FieldNode, OperationDefinitionNode, VariableDefinitionNode } from 'graphql'
import { print } from 'graphql/language/printer.js'
import { cache } from 'react';
import { traverse } from 'object-traversal';
import isInteger from 'is-integer';


export type ApiQueryOptions<V = void> = {
  variables?: V;
  includeDrafts?: boolean;
  excludeInvalid?: boolean;
  visualEditingBaseUrl?: string | undefined;
  revalidate?: number | undefined;
  tags?: string[] | undefined,
  generateTags?: boolean
  logs?: boolean
  all?: boolean
};

export type DefaultApiQueryOptions = ApiQueryOptions & {
  variables: undefined,
  includeDrafts: boolean,
  excludeInvalid: boolean,
  visualEditingBaseUrl: string | undefined,
  revalidate: number | undefined,
  tags: string[] | undefined,
  generateTags: boolean,
  logs: boolean
  all: boolean
}

const defaultOptions: DefaultApiQueryOptions = {
  variables: undefined,
  includeDrafts: false,
  excludeInvalid: true,
  visualEditingBaseUrl: undefined,
  revalidate: isInteger(process.env.REVALIDATE_TIME) ? parseInt(process.env.REVALIDATE_TIME) : 3600,
  tags: undefined,
  generateTags: true,
  logs: false,
  all: false
};


export default async function apiQuery<T, V = void>(query: DocumentNode, options?: ApiQueryOptions<V>): Promise<T & { draftUrl: string | null }> {

  const opt = { ...defaultOptions, ...(options ?? {}) };

  if (!process.env.DATOCMS_API_TOKEN)
    throw new Error('DATOCMS_API_TOKEN is not set')
  if (!process.env.DATOCMS_ENVIRONMENT)
    throw new Error('DATOCMS_ENVIRONMENT is not set')

  const queryId = (query.definitions?.[0] as any).name?.value as string

  if (typeof options?.includeDrafts === 'undefined')
    try { opt.includeDrafts = draftMode().isEnabled } catch (e) { }

  const dedupeOptions: DedupeOptions = {
    body: JSON.stringify({ query: print(query), variables: options?.variables }) as string,
    ...opt,
    queryId
  }

  const tags = opt.generateTags ? generateIdTags(await dedupedFetch(dedupeOptions), opt.tags, queryId) : opt.tags
  const res = opt.includeDrafts ? await dedupedFetch({ ...dedupeOptions, tags, url: 'https://graphql-listen.datocms.com/preview' }) : {}

  opt.logs && console.log('calling', queryId)
  const { data } = await dedupedFetch({ ...dedupeOptions, tags });

  if (opt.all) {
    const paginatedData = await paginatedQuery<T, V>(query, opt, data, queryId)
    return { ...paginatedData, draftUrl: res.url ?? null }
  }

  return { ...data, draftUrl: res.url ?? null }
}


const paginatedQuery = async <T, V = void>(query: DocumentNode, options: ApiQueryOptions<any>, data: any, queryId: string): Promise<T> => {

  try {

    if (typeof data !== 'object' || data === null || data === undefined)
      throw new Error('Data must be an object')

    const operation = query.definitions?.find(({ kind }) => kind === 'OperationDefinition') as OperationDefinitionNode

    if (!operation)
      throw new Error('Query must have an operation definition')

    const firstVariable = operation.variableDefinitions?.find(v => v.variable.name.value === 'first') as VariableDefinitionNode
    const skipVariable = operation.variableDefinitions?.find(v => v.variable.name.value === 'skip') as VariableDefinitionNode

    if (!firstVariable || !skipVariable)
      throw new Error(`Query must have first and skip variables`)

    const pageKeys = Object.keys(data).filter(k => k.startsWith('_all') && k.endsWith('Meta'))

    if (pageKeys.length === 0)
      throw new Error('Query must have at least one paginated field')

    const pageKeyMap = pageKeys.reduce<{ [key: string]: string }>((acc, cur) => {
      acc[cur] = `${cur.substring(1, cur.length - 'Meta'.length)}`
      return acc
    }, {})

    // Check filter diff
    Object.keys(pageKeyMap).forEach(k => {
      const filter = (operation.selectionSet.selections.find(s => (s as FieldNode).name.value === k) as FieldNode)?.arguments?.find(a => a.name.value === 'filter')
      const metaFilter = (operation.selectionSet.selections.find(s => (s as FieldNode).name.value === pageKeyMap[k]) as FieldNode)?.arguments?.find(a => a.name.value === 'filter')
      if ((!filter && metaFilter) || (filter && !metaFilter) || JSON.stringify(filter) !== JSON.stringify(metaFilter))
        throw new Error(`Query must have same filter argument on ${k} and ${pageKeyMap[k]}`)
    })

    const first = options.variables?.first ?? (firstVariable?.defaultValue as any)?.value ?? 100

    if (first > 100)
      throw new Error('"first" variable must be less than or equal to 100')

    let count = 0

    while (Object.keys(pageKeyMap).some(k => data[k].count > data[pageKeyMap[k]].length)) {
      const maxPageKey = pageKeyMap[Object.keys(pageKeyMap).sort((a, b) => data[a].count > data[b].count ? -1 : 1)[0]]
      const skip = data[maxPageKey].length

      const pageData: any = await apiQuery(query, {
        ...options,
        all: false,
        variables: {
          ...options.variables,
          first,
          skip
        }
      })

      Object.keys(pageKeyMap).forEach(k =>
        data[pageKeyMap[k]] = [...data[pageKeyMap[k]], ...pageData[pageKeyMap[k]]]
      )

      if (++count > 1000) {
        throw new Error('Paginated query exceeded 1000 requests')
      }
    }

    return data
  } catch (e) {
    throw new Error(`${queryId}: ${(e as Error).message}`)
  }
}

export type DedupeOptions = {
  url?: string
  body: string;
  includeDrafts: boolean;
  excludeInvalid: boolean;
  visualEditingBaseUrl: string | undefined;
  revalidate?: number;
  tags?: string[] | undefined
  queryId: string,
  logs: boolean
}

const dedupedFetch = cache(async (options: DedupeOptions) => {
  const {
    url,
    body,
    includeDrafts,
    excludeInvalid,
    visualEditingBaseUrl,
    revalidate,
    tags,
    queryId,
    logs
  } = options;

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
  } as unknown as HeadersInit

  const response = await fetch(url ?? 'https://graphql.datocms.com/', {
    method: 'POST',
    headers,
    body,
    next: {
      revalidate,
      tags: Array.isArray(tags) ? tags : undefined
    }
  } as RequestInit);

  const responseBody = await response.json();

  if (!response.ok)
    throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(responseBody)}`);

  logs && console.log(queryId, { ...options, body: undefined }, response.headers.get('x-cache'))
  return responseBody;
})

const generateIdTags = (data: any, tags: string[] | undefined, queryId: string): string[] => {

  const allTags: string[] = tags?.length ? tags : []
  traverse(data, ({ key, value }) => key === 'id' && allTags.push(String(value)))
  const uniqueTags = allTags.filter((value, index, self) => self.indexOf(value) === index).filter(t => t)
  return uniqueTags
}

