import type { DocumentNode } from 'graphql';
export type ApiQueryOptions<V = void> = {
    variables?: V;
    includeDrafts?: boolean;
    excludeInvalid?: boolean;
    visualEditingBaseUrl?: string | undefined;
    revalidate?: number | undefined;
    tags?: string[] | undefined;
    generateTags?: boolean;
    maxTags?: number;
    logs?: boolean;
    all?: boolean;
};
export type DefaultApiQueryOptions = ApiQueryOptions & {
    variables: undefined;
    includeDrafts: boolean;
    excludeInvalid: boolean;
    visualEditingBaseUrl: string | undefined;
    revalidate: number | undefined;
    tags: string[] | undefined;
    generateTags: boolean;
    maxTags: number;
    logs: boolean;
    all: boolean;
};
export default function apiQuery<T, V = void>(query: DocumentNode, options?: ApiQueryOptions<V>): Promise<T & {
    draftUrl: string | null;
}>;
export type DedupeOptions = {
    url?: string;
    body: string;
    includeDrafts: boolean;
    excludeInvalid: boolean;
    visualEditingBaseUrl: string | undefined;
    revalidate?: number;
    tags?: string[] | undefined;
    queryId: string;
    logs: boolean;
};
