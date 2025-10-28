export default async function vercelCronAuth(req, callback) {
    if (!process.env.CRON_SECRET)
        throw new Error('CRON_SECRET not set in .env');
    if (req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`)
        return await callback(req);
    else
        return new Response('Access denied', { status: 401 });
}
