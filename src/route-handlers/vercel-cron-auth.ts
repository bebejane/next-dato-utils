
export default async function vercelCronAuth(req: Request, callback: (req: Request) => Promise<Response>): Promise<Response> {

  if (!process.env.CRON_SECRET)
    throw new Error('CRON_SECRET not set in .env')

  if (req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`)
    return await callback(req)
  else
    return new Response('Access denied', { status: 401 })

}