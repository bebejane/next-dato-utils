const u = process.env.BASIC_AUTH_USER;
const p = process.env.BASIC_AUTH_PASSWORD;

export default async function basicAuth(
	req: Request,
	callback?: (req: Request) => Promise<Response>,
	options?: { username: string; password: string }
): Promise<Response> {
	if (req.method === 'OPTIONS') return new Response('OK', { status: 200 });

	if (process.env.NODE_ENV === 'development')
		return callback ? await callback(req) : new Response('OK', { status: 200 });

	const basicAuth = req.headers.get('authorization');

	if (!basicAuth) return new Response('Access denied', { status: 401 });

	const auth = basicAuth.split(' ')[1];
	const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');
	const username = options?.username || process.env.BASIC_AUTH_USER;
	const password = options?.password || process.env.BASIC_AUTH_PASSWORD;
	const isAuthorized = user === username && pwd === password;

	if (!isAuthorized) {
		//console.log(username, password, process.env.BASIC_AUTH_USER, process.env.BASIC_AUTH_PASSWORD, user, pwd);
		const challenge = `Basic relm="private"`;
		return new Response('Access denied. Wrong password or username.', {
			status: 401,
			headers: {
				'WWW-Authenticate': challenge,
			},
		});
	}
	if (callback) return await callback(req);
	return new Response('OK', { status: 200 });
}
