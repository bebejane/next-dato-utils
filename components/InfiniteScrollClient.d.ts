import { TypedDocumentNode } from 'next-dato-utils/api';
export type InfiniteScrollProps<ComponetProps> = {
    id: string;
    initial: ComponetProps[];
    query: TypedDocumentNode;
    variables?: Record<string, any>;
    children: React.JSXElementConstructor<ComponetProps>;
    loader?: React.JSX.Element | null;
    error?: React.JSXElementConstructor<any>;
    rootMargin?: string;
    sleep?: number;
};
export default function InfiniteScroll<ComponetProps>({ id, initial, query, variables, children: Component, loader: Loader, error: Error, rootMargin, sleep: _sleep, }: InfiniteScrollProps<ComponetProps>): React.ReactNode;
