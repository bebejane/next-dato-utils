export type Middleware = (req: Request, next: (error: Error) => void) => Promise<Response | void>;
export declare const handler: (...middleware: Middleware[]) => (request: Request) => Promise<Response>;
export default handler;
