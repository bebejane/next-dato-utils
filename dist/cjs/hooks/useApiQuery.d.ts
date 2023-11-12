import type { DocumentNode } from 'graphql';
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
declare const useApiQuery: <T, V>(document: DocumentNode, { variables, initialData, pageSize, includeDrafts }?: UseApiQueryProps) => {
    data: T;
    error: Error | undefined;
    loading: boolean;
    loadMore: (vars: any) => Promise<any>;
    nextPage: () => Promise<void | {
        no: number;
        count: any;
        end: boolean;
        size: number;
    }>;
    page: Pagination | undefined;
};
export default useApiQuery;
