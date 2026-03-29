import { TypedDocumentNode } from '../api';
export type InfiniteScrollProps<ComponetProps> = {
    id: string;
    initial: ComponetProps[];
    query: TypedDocumentNode;
    variables?: Record<string, any>;
    children: React.JSXElementConstructor<ComponetProps>;
    loader?: React.JSXElementConstructor<any>;
    error?: React.JSXElementConstructor<any>;
    rootMargin?: string;
};
export default function InfiniteScroll<ComponetProps>({ id, initial, query, variables, children: Component, loader: Loader, error: Error, rootMargin, }: InfiniteScrollProps<ComponetProps>): React.ReactNode;
