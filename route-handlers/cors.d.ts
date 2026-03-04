/**
 * Multi purpose CORS lib.
 * Note: Based on the `cors` package in npm but using only
 * web APIs. Feel free to use it in your own projects.
 */
type StaticOrigin = boolean | string | RegExp | (boolean | string | RegExp)[];
type OriginFn = (origin: string | undefined, req: Request) => StaticOrigin | Promise<StaticOrigin>;
interface CorsOptions {
    origin?: StaticOrigin | OriginFn;
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
}
export default function cors(req: Request, res: Response, options?: CorsOptions): Promise<Response>;
export declare function initCors(options?: CorsOptions): (req: Request, res: Response) => Promise<Response>;
export {};
