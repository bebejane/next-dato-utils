import type { DocumentNode } from 'graphql';
export interface TypedDocumentNode<TResult = {
    [key: string]: any;
}, TVariables = {
    [key: string]: any;
}> extends DocumentNode {
    __apiType?: (variables: TVariables) => TResult;
    __resultType?: TResult;
    __variablesType?: TVariables;
}
export type ApiQueryOptions<V = void> = {
    variables?: V;
    tags?: string[];
    includeDrafts?: boolean;
    excludeInvalid?: boolean;
    cacheTags?: boolean;
    revalidate?: number | undefined;
    logs?: boolean;
    all?: boolean;
    apiToken?: string;
    environment?: string;
    contentLink?: string;
    baseEditingUrl?: string;
};
export type DefaultApiQueryOptions = ApiQueryOptions & {
    variables: undefined;
    tags: undefined;
    includeDrafts: boolean;
    excludeInvalid: boolean;
    cacheTags: boolean;
    visualEditingBaseUrl: string | undefined;
    revalidate: number | undefined;
    logs: boolean;
    all: boolean;
    apiToken?: string;
    environment?: string;
    contentLink?: string;
    baseEditingUrl?: string;
};
export default function apiQuery<TResult = any, TVariables = Record<string, any>>(query: TypedDocumentNode<TResult, TVariables>, options?: ApiQueryOptions<TVariables>): Promise<TResult & {
    draftUrl: string | null;
}>;
export type DedupeOptions = {
    url?: string;
    body: string;
    includeDrafts: boolean;
    excludeInvalid: boolean;
    cacheTags: boolean;
    visualEditingBaseUrl: string | undefined;
    revalidate?: number;
    tags?: string[] | undefined;
    queryId: string;
    logs: boolean;
    apiToken?: string;
    environment?: string;
};
