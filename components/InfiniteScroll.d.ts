export type InfiniteScrollProps<ComponetProps> = {
    id: string;
    initial: ComponetProps[];
    params?: Record<string, any>;
    next(offset: number, params?: Record<string, any>): Promise<ComponetProps[]>;
    children: React.JSXElementConstructor<ComponetProps>;
    loader?: React.JSXElementConstructor<any>;
    error?: React.JSXElementConstructor<any>;
    rootMargin?: string;
};
export default function InfiniteScroll<ComponetProps>({ id, initial, params, next: _next, children: Component, loader: Loader, error: Error, rootMargin, }: InfiniteScrollProps<ComponetProps>): React.ReactNode;
