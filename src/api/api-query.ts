'use server'

import { draftMode } from 'next/headers.js'
import type { DocumentNode } from 'graphql'
import { print } from 'graphql/language/printer.js'
import { cache } from 'react';
import { traverse } from 'object-traversal';
import isInteger from 'is-integer';

export type ApiQueryOptions<V> = {
  variables?: V | undefined;
  includeDrafts?: boolean;
  excludeInvalid?: boolean;
  visualEditingBaseUrl?: string | undefined;
  revalidate?: number | undefined;
  tags?: string[] | undefined,
  generateTags?: boolean
};

export type DefaultApiQueryOptions = ApiQueryOptions<any> & {
  variables: undefined,
  includeDrafts: boolean,
  excludeInvalid: boolean,
  visualEditingBaseUrl: string | undefined,
  revalidate: number | undefined,
  tags: string[] | undefined,
  generateTags: boolean,
}

const defaultOptions: DefaultApiQueryOptions = {
  variables: undefined,
  includeDrafts: false,
  excludeInvalid: true,
  visualEditingBaseUrl: undefined,
  revalidate: isInteger(process.env.REVALIDATE_TIME) ? parseInt(process.env.REVALIDATE_TIME) : 3600,
  tags: undefined,
  generateTags: true
};


export default async function apiQuery<T, V>(query: DocumentNode, options?: ApiQueryOptions<V>): Promise<T & { draftUrl: string | null }> {

  const opt = Object.assign(defaultOptions, options ?? {});

  if (!process.env.DATOCMS_API_TOKEN)
    throw new Error('DATOCMS_API_TOKEN is not set')
  if (!process.env.DATOCMS_ENVIRONMENT)
    throw new Error('DATOCMS_ENVIRONMENT is not set')

  const queryId = (query.definitions?.[0] as any).name?.value as string
  let includeDrafts = opt.includeDrafts ?? false;

  if (typeof opt.includeDrafts === 'undefined')
    try { includeDrafts = draftMode().isEnabled } catch (e) { }

  const dedupeOptions: DedupeOptions = {
    body: JSON.stringify({ query: print(query), variables: options?.variables }) as string,
    ...opt,
    queryId
  }

  const tags = opt.generateTags ? generateIdTags(await dedupedFetch(dedupeOptions), opt.tags, queryId) : opt.tags
  const res = includeDrafts ? await dedupedFetch({ ...dedupeOptions, tags, url: 'https://graphql-listen.datocms.com/preview' }) : {}
  const { data } = await dedupedFetch({ ...dedupeOptions, tags });
  return { ...data, draftUrl: res.url ?? null }
}

export type DedupeOptions = {
  url?: string
  body: string;
  includeDrafts: boolean;
  excludeInvalid: boolean;
  visualEditingBaseUrl: string | undefined;
  revalidate?: number;
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
    tags,
    queryId
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

  const next: { revalidate?: number, tags?: string[] } = { revalidate }

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
  console.log(queryId, options)
  return responseBody;
})

const generateIdTags = (data: any, tags: string[] | undefined, queryId: string): string[] => {

  const allTags: string[] = tags?.length ? tags : []
  traverse(data, ({ key, value }) => key === 'id' && allTags.push(value))
  const uniqueTags = allTags.filter((value, index, self) => self.indexOf(value) === index).filter(t => t)
  return uniqueTags
}