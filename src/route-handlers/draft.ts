//@ts-expect-error
import { draftMode } from 'next/headers';
//@ts-expect-error
import { redirect } from 'next/navigation';
//@ts-expect-error
import { cookies } from 'next/headers';

//@ts-expect-error
export default async function draft(request: Request, searchParams?: URLSearchParams): Promise<Response> {
	searchParams = searchParams ?? new URL(request.url).searchParams;

	const secret = searchParams.get('secret');
	const slug = searchParams.get('slug');
	const maxAge = searchParams.get('max-age');
	const exit = searchParams.get('exit');

	if (secret !== process.env.DATOCMS_PREVIEW_SECRET) return new Response('Invalid token', { status: 401 });

	if (exit !== null) {
		(await draftMode()).disable();
	} else {
		(await draftMode()).enable();
	}

	if (maxAge) {
		const bypassCookie = (await cookies()).get('__prerender_bypass');
		if (!bypassCookie) {
			throw new Error('No bypass cookie found');
		}

		(await cookies()).set(bypassCookie.name, bypassCookie.value, {
			httpOnly: true,
			sameSite: 'none',
			secure: true,
			path: '/',
			maxAge: parseInt(maxAge),
		});
	}

	if (slug) redirect(slug);
	else return new Response('OK', { status: 200 });
}
