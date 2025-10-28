import { DatoCmsConfig } from '../config/index.js';
export type RouteHandler = (req: Request, { params }: {
    params: Promise<{
        route: string;
    }>;
}, config: DatoCmsConfig) => Promise<Response>;
export type DatoCmsRouter = {
    POST: RouteHandler;
    GET: RouteHandler;
};
declare const router: (req: Request, { params }: {
    params: Promise<{
        route: string;
    }>;
}, config: DatoCmsConfig) => Promise<Response>;
export default router;
