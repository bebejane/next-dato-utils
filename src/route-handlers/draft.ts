import { draftMode } from 'next/headers';
import { cookies } from 'next/headers';

export default async function draft(
	request: Request,
	searchParams?: URLSearchParams,
): Promise<Response> {
	searchParams = searchParams ?? new URL(request.url).searchParams;

	const check = searchParams.get('check');
	const secret = searchParams.get('secret');
	const slug = searchParams.get('slug') ?? searchParams.get('redirect') ?? '/';
	const maxAge = searchParams.get('max-age');
	const exit = searchParams.get('exit');
	const host = request.headers.get('host');
	console.log(host);

	if (check) {
		const enabled = (await draftMode()).isEnabled;
		const secret = (await cookies()).get('secret')?.value;
		return new Response(JSON.stringify({ secret, enabled }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	if (exit !== null) {
		console.log('draft mode:', 'exit', slug);
		(await draftMode()).disable();
		return new Response('ok', { status: 307, headers: { Location: slug } });
	}

	if (secret !== process.env.DATOCMS_PREVIEW_SECRET) {
		return new Response('Invalid token', { status: 401 });
	} else {
		(await cookies()).set('secret', secret, {
			httpOnly: true,
			sameSite: 'none',
			secure: true,
			path: '/',
		});
	}

	if (!slug) {
		return new Response('Invalid slug', { status: 400 });
	}

	(await draftMode()).enable();

	if (maxAge) {
		const bypassCookie = (await cookies()).get('__prerender_bypass');
		if (!bypassCookie) throw new Error('No bypass cookie found');

		(await cookies()).set(bypassCookie.name, bypassCookie.value, {
			httpOnly: true,
			sameSite: 'none',
			secure: true,
			path: '/',
			maxAge: parseInt(maxAge),
		});
	}

	if (slug) return new Response('OK', { status: 307, headers: { Location: slug } });
	else return new Response('OK', { status: 200 });
}
