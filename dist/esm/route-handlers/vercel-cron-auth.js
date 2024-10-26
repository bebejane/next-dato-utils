export default function vercelCronAuth(callback) {
    return async (req, res) => {
        if (!process.env.CRON_SECRET)
            throw new Error('CRON_SECRET not set in .env');
        console.log(req.headers);
        if (req.headers?.authorization === `Basic ${process.env.CRON_SECRET}`)
            return callback(req, res);
        else
            return res.status(401).send('Access denied');
    };
}
//# sourceMappingURL=vercel-cron-auth.js.map