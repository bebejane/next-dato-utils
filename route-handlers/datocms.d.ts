export type RouteHandler = (req: Request, { params }: {
    params: Promise<{
        slug: string;
    }>;
}) => Promise<Response>;
export type DatoCmsRouter = {
    POST: RouteHandler;
    GET: RouteHandler;
};
declare const _default: {
    POST: RouteHandler;
    GET: RouteHandler;
};
export default _default;
