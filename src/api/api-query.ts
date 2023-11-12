'use server'

import type { DocumentNode } from 'graphql';
import { print } from 'graphql';
import { cache } from 'react';

export type ApiQueryOptions<V> = {
  variables?: V;
  includeDrafts?: boolean;
  excludeInvalid?: boolean;
  visualEditingBaseUrl?: string | undefined;
  revalidate?: number;
  tags?: string[] | undefined,
  generateTags?: boolean
};

export default async function apiQuery<T, V>(query: DocumentNode, options?: ApiQueryOptions<V>): Promise<T & { draftUrl: string | null }> {

  options = options ?? {}

  if (!process.env.DATOCMS_API_TOKEN)
    throw new Error('DATOCMS_API_TOKEN is not set')
  if (!process.env.DATOCMS_ENVIRONMENT)
    throw new Error('DATOCMS_ENVIRONMENT is not set')

  const queryId = (query.definitions?.[0] as any).name?.value as string
  const revalidate = options?.includeDrafts ? 0 : typeof options?.revalidate === 'number' ? options.revalidate : parseInt(process.env.REVALIDATE_TIME) ?? 3600

  const dedupeOptions: DedupeOptions = {
    body: JSON.stringify({ query: print(query), variables: options?.variables }) as string,
    includeDrafts: options.includeDrafts ?? false,
    excludeInvalid: options.excludeInvalid ?? true,
    visualEditingBaseUrl: options.visualEditingBaseUrl ?? undefined,
    revalidate,
    tags: options.tags ?? undefined,
    queryId
  }

  const tags = options.generateTags ? generateIdTags(await dedupedFetch(dedupeOptions), options.tags ?? null, queryId) : options.tags
  const res = options.includeDrafts ? await dedupedFetch({ ...dedupeOptions, url: 'https://graphql-listen.datocms.com/preview' }) : {}
  const { data } = await dedupedFetch({ ...dedupeOptions, tags });
  return { ...data, draftUrl: res.url ?? null }
}

export type DedupeOptions = {
  url?: string
  body: string;
  includeDrafts: boolean;
  excludeInvalid: boolean;
  visualEditingBaseUrl: string | undefined;
  revalidate?: number | undefined;
  tags?: string[] | undefined
  queryId: string
}

const dedupedFetch = cache(async (options: DedupeOptions) => {
  const {
    url,
    body,
    includeDrafts,
    excludeInvalid,
    visualEditingBaseUrl,
    revalidate,
    tags
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

  const next: { revalidate?: number, tags?: string[] } = {}

  if (revalidate !== null)
    next['revalidate'] = revalidate
  if (tags && tags?.length > 0)
    next['tags'] = tags

  const response = await fetch(url ?? 'https://graphql.datocms.com/', {
    method: 'POST',
    headers,
    body,
    next,
  });

  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText}: ${JSON.stringify(
        responseBody,
      )}`,
    );
  }

  return responseBody;
})

const generateIdTags = (data: any, tags: string[] | null, queryId: string): string[] => {

  const allTags: string[] = []

  iterateObject(data, (key, value) => {
    key === 'id' && allTags.push(value)
    return true
  })

  tags?.length && allTags.push.apply(allTags, tags)
  const idTags = allTags.filter((value, index, self) => self.indexOf(value) === index) // dedupe
  console.log('idTags', queryId, idTags)
  return idTags

}

const iterateObject = (obj: any, fn: (key: string, value: any, obj: any) => boolean) => {
  let i = 0
    , keys = []
    ;

  if (Array.isArray(obj)) {
    for (; i < obj.length; ++i) {
      if (fn(obj[i], i, obj) === false)
        break;
    }
  } else if (typeof obj === "object" && obj !== null) {
    keys = Object.keys(obj);
    for (; i < keys.length; ++i) {
      if (fn(obj[keys[i]], keys[i], obj) === false)
        break;
    }
  }
}