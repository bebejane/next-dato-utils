import vercelCronAuth from './vercel-cron-auth.js';
import { buildClient } from '@datocms/cma-client-browser';
const backup = async (req) => {
    return vercelCronAuth(req, async (req) => {
        if (!process.env.DATOCMS_ENVIRONMENT)
            throw new Error('DATOCMS_ENVIRONMENT not set in .env');
        if (!process.env.DATOCMS_API_TOKEN)
            throw new Error('DATOCMS_API_TOKEN not set in .env');
        try {
            const params = new URLSearchParams(req.url.split('?')?.[1]);
            const maxBackups = params.get('max') ? parseInt(params.get('max')) : 1;
            const backupPrefix = 'auto-backup-';
            const client = buildClient({
                environment: process.env.DATOCMS_ENVIRONMENT,
                apiToken: process.env.DATOCMS_API_TOKEN,
                requestTimeout: 3000,
            });
            const backups = (await client.environments.list())
                .filter((e) => e.id.startsWith('auto-backup') && e.meta.primary === false)
                .sort((a, b) => (a.id.replace(backupPrefix, '') > b.id.replace(backupPrefix, '') ? -1 : 1));
            const today = new Date().toISOString().replace('T', '-').replaceAll(':', '-').replace('Z', '').split('.')[0];
            const name = `auto-backup-${today}`;
            console.log('Last backup was: ', backups[0]?.id ?? 'none');
            console.log(`Max backups: ${backup.length}/${maxBackups}`);
            console.log('Creating backup...', name);
            for (let i = 0; i < backups.reverse().slice(maxBackups - 1).length; i++) {
                try {
                    console.log('Deleting old backup...', backups[i].id);
                    await client.environments.destroy(backups[i].id);
                }
                catch (e) {
                    console.error(e);
                }
            }
            await client.environments.fork(process.env.DATOCMS_ENVIRONMENT, { id: name }, {
                immediate_return: false,
                fast: true,
                force: true,
            });
            console.log('Backup done!');
            return new Response(`Backup done ${process.env.DATOCMS_ENVIRONMENT} > ${name}`, { status: 200 });
        }
        catch (e) {
            console.log(e);
            return new Response(`Backup failed: ${e.message}`, { status: 500 });
        }
    });
};
export default backup;
//# sourceMappingURL=backup.js.map