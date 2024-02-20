"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function vercelCronAuth(req, callback) {
    if (!process.env.CRON_SECRET)
        throw new Error('CRON_SECRET not set in .env');
    if (req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`)
        return await callback(req);
    else
        return new Response('Access denied', { status: 401 });
}
exports.default = vercelCronAuth;
//# sourceMappingURL=vercel-cron-auth.js.map