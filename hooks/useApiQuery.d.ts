import { type TypedDocumentNode } from '../api/index.js';
export type UseApiQueryProps = {
    variables?: any;
    initialData?: any;
    pageSize?: number;
    includeDrafts?: boolean;
};
export type Pagination = {
    no: number;
    count: number;
    size: number;
    end: boolean;
};
declare const useApiQuery: <TResult = any, TVariables = Record<string, any>>(document: TypedDocumentNode<TResult, TVariables>, { variables, initialData, pageSize, includeDrafts }?: UseApiQueryProps) => {
    data: TResult;
    error: Error | undefined;
    loading: boolean;
    loadMore: (vars: any) => Promise<any>;
    nextPage: () => Promise<void | {
        size: number;
        no: number;
        count: any;
        end: boolean;
    }>;
    page: Pagination | undefined;
};
export default useApiQuery;
