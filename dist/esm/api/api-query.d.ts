import type { DocumentNode } from 'graphql';
export type ApiQueryOptions<V> = {
    variables?: V | undefined;
    includeDrafts?: boolean;
    excludeInvalid?: boolean;
    visualEditingBaseUrl?: string | undefined;
    revalidate?: number | undefined;
    tags?: string[] | undefined;
    generateTags?: boolean;
    logs?: boolean;
};
export type DefaultApiQueryOptions = ApiQueryOptions<any> & {
    variables: undefined;
    includeDrafts: boolean;
    excludeInvalid: boolean;
    visualEditingBaseUrl: string | undefined;
    revalidate: number | undefined;
    tags: string[] | undefined;
    generateTags: boolean;
    logs?: boolean;
};
export default function apiQuery<T, V>(query: DocumentNode, options?: ApiQueryOptions<V>): Promise<T & {
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
    logs?: boolean;
};
