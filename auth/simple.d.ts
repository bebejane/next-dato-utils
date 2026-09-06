export declare function getSession(): Promise<string | undefined>;
export declare function simpleAuth(req: Request, next: (req: Request) => Promise<Response>): Promise<Response>;
export declare function login(req: Request, next: (req: Request) => Promise<Response>): Promise<Response>;
export declare function logout(req: Request, next: (req: Request) => Promise<Response>): Promise<Response>;
