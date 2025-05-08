export type RouteHandler = (req: Request, { params }: {
    params: Promise<{
        slug: string;
    }>;
}) => Promise<Response>;
export type DatoCmsRouter = {
    POST: RouteHandler;
    GET: RouteHandler;
};
declare const POST: RouteHandler;
declare const GET: RouteHandler;
export { POST, GET };
