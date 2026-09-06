import { cookies } from 'next/headers';
export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    return session?.value;
}
export async function simpleAuth(req, next) {
    const session = await getSession();
    if (session)
        return next(req);
    return new Response('Unauthorized', { status: 401 });
}
export async function login(req, next) {
    const session = await getSession();
    if (session)
        return next(req);
    const body = await req.json();
    if (!body)
        throw new Error('No form data in request body');
    const { username, password } = body;
    if (password === process.env.SIMPLE_AUTH_PASSWORD &&
        (username === process.env.SIMPLE_AUTH_USERNAME || !process.env.SIMPLE_AUTH_USERNAME)) {
        const cookieStore = await cookies();
        cookieStore.set('session', 'admin', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });
        return next(req);
    }
    return new Response('Unauthorized', { status: 401 });
}
export async function logout(req, next) {
    const cookieStore = await cookies();
    cookieStore.delete('session');
    return next(req);
}
//# sourceMappingURL=simple.js.map