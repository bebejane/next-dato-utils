import { timingSafeEqual } from 'node:crypto';

function safeEqual(a: string, b: string): boolean {
	const aBuf = Buffer.from(a);
	const bBuf = Buffer.from(b);
	if (aBuf.length !== bBuf.length) return false;
	return timingSafeEqual(aBuf, bBuf);
}

function unauthorized(): Response {
	return new Response('Access denied. Wrong password or username.', {
		status: 401,
		headers: {
			'WWW-Authenticate': `Basic realm="private"`,
		},
	});
}

export default async function basicAuth(
	req: Request,
	callback?: (req: Request) => Promise<Response>,
	options?: { username: string; password: string },
): Promise<Response> {
	if (req.method === 'OPTIONS') return new Response('OK', { status: 200 });

	// Read credentials per request so rotation does not require a redeploy.
	const username = options?.username || process.env.BASIC_AUTH_USER;
	const password = options?.password || process.env.BASIC_AUTH_PASSWORD;

	if (!username || !password) return unauthorized();

	const header = req.headers.get('authorization');
	if (!header) return unauthorized();

	const spaceIndex = header.indexOf(' ');
	if (spaceIndex === -1) return unauthorized();

	const scheme = header.slice(0, spaceIndex);
	const encoded = header.slice(spaceIndex + 1).trim();
	if (scheme.toLowerCase() !== 'basic' || !encoded) return unauthorized();

	// Buffer.from never throws on a string, but malformed input simply decodes
	// to something that won't match.
	const decoded = Buffer.from(encoded, 'base64').toString('utf8');
	const separator = decoded.indexOf(':');
	if (separator === -1) return unauthorized();

	const user = decoded.slice(0, separator);
	const pwd = decoded.slice(separator + 1);

	// Constant-time comparison to avoid leaking credentials via timing.
	const isAuthorized = safeEqual(user, username) && safeEqual(pwd, password);
	if (!isAuthorized) return unauthorized();

	if (callback) return await callback(req);
	return new Response('OK', { status: 200 });
}
