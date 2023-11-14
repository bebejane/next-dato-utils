import type { DocumentNode } from 'graphql';
export type ApiQueryOptions<V> = {
    variables?: V;
    includeDrafts?: boolean;
    excludeInvalid?: boolean;
    visualEditingBaseUrl?: string | undefined;
    revalidate?: number;
    tags?: string[] | undefined;
    generateTags?: boolean;
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
    revalidate?: number | undefined;
    tags?: string[] | undefined;
    queryId: string;
};
