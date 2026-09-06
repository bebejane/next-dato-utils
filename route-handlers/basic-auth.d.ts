export default function basicAuth(req: Request, callback?: (req: Request) => Promise<Response>, options?: {
    username: string;
    password: string;
}): Promise<Response>;
