export type InfiniteScrollProps<ComponetProps> = {
    id: string;
    initial: ComponetProps[];
    params?: Record<string, any>;
    next(offset: number, params?: Record<string, any>): Promise<ComponetProps[]>;
    children: React.JSXElementConstructor<ComponetProps>;
    loader?: React.ReactNode;
    rootMargin?: string;
};
export default function InfiniteScroll<ComponetProps>({ id, initial, params, next: _next, children: Component, loader, rootMargin, }: InfiniteScrollProps<ComponetProps>): React.ReactNode;
