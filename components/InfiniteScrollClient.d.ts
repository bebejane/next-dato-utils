import { TypedDocumentNode } from 'next-dato-utils/api';
import { ApiQueryOptions } from '../api/api-query';
export type InfiniteScrollProps<ComponetProps> = {
    id: string;
    initial: ComponetProps[];
    query: TypedDocumentNode;
    variables?: Record<string, any>;
    options?: ApiQueryOptions;
    children: React.JSXElementConstructor<ComponetProps>;
    loader?: React.JSX.Element | null;
    error?: React.JSXElementConstructor<any>;
    rootMargin?: string;
    sleep?: number;
};
export default function InfiniteScroll<ComponetProps>({ id, initial, query, variables, children: Component, loader: Loader, error: Error, rootMargin, options, sleep: _sleep, }: InfiniteScrollProps<ComponetProps>): React.ReactNode;
