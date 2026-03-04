import { draftMode } from 'next/headers';
import { cookies } from 'next/headers';
export default async function draft(request, searchParams) {
    searchParams = searchParams ?? new URL(request.url).searchParams;
    const check = searchParams.get('check');
    const secret = searchParams.get('secret');
    const slug = searchParams.get('slug') ?? searchParams.get('redirect') ?? '/';
    const maxAge = searchParams.get('max-age');
    const exit = searchParams.get('exit');
    const bypassCookie = (await cookies()).get('__prerender_bypass');
    if (check) {
        const enabled = (await draftMode()).isEnabled;
        return new Response(enabled ? '1' : '0', { status: 200 });
    }
    if (exit !== null) {
        console.log('draft mode:', 'exit', slug);
        (await draftMode()).disable();
        return new Response('ok', { status: 307, headers: { Location: slug } });
    }
    if (secret !== process.env.DATOCMS_PREVIEW_SECRET) {
        console.log('draft mode:', 'invalid token', slug, secret);
        return new Response('Invalid token', { status: 401 });
    }
    if (!slug) {
        console.log('draft mode:', 'invalid slug', slug);
        return new Response('Invalid slug', { status: 400 });
    }
    console.log('draft mode:', 'enable', slug);
    (await draftMode()).enable();
    if (maxAge) {
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
    if (slug)
        return new Response('OK', { status: 307, headers: { Location: slug } });
    else
        return new Response('OK', { status: 200 });
}
//# sourceMappingURL=draft.js.map