"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function basicAuth(req, callback, options) {
    if (req.method === 'OPTIONS')
        return callback ? await callback(req) : new Response('OK', { status: 200 });
    const basicAuth = req.headers.get('authorization');
    if (!basicAuth)
        return new Response('Access denied', { status: 401 });
    const auth = basicAuth.split(' ')[1];
    const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');
    const username = options?.username || process.env.BASIC_AUTH_USER;
    const password = options?.password || process.env.BASIC_AUTH_PASSWORD;
    const isAuthorized = user === username && pwd === password;
    if (!isAuthorized)
        return new Response('Access denied. Wrong password or username.', { status: 401 });
    if (callback)
        return await callback(req);
    return new Response('OK', { status: 200 });
}
exports.default = basicAuth;
//# sourceMappingURL=basic-auth.js.map