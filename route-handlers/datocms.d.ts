import { DatoCmsConfig } from '../config';
export type DatoCmsRouter = {
    POST: (req: Request) => Promise<Response>;
    GET: (req: Request) => Promise<Response>;
};
declare const _default: (req: Request, { params }: {
    params: Promise<{
        slug: string;
    }>;
}, config: DatoCmsConfig) => Promise<DatoCmsRouter>;
export default _default;
