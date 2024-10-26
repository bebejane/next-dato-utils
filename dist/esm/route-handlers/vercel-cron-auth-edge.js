export default function withVercelCronAuthEdge(callback) {
    return async (req, res) => {
        if (!process.env.CRON_SECRET)
            throw new Error('CRON_SECRET not set in .env');
        if (req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`)
            return callback(req, res);
        else
            return new Response('Access denied', { status: 401 });
    };
}
//# sourceMappingURL=vercel-cron-auth-edge.js.map