'use server';
import { draftMode } from 'next/headers.js';
import { redirect } from 'next/navigation.js';
import { cookies } from 'next/headers.js';
import { disableDraftMode } from '../server-actions/index.js';
export default async function draft(request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const slug = searchParams.get('slug');
    const maxAge = searchParams.get('max-age');
    const exit = searchParams.get('exit');
    if (exit === 'true') {
        console.log('Disabling draft mode');
        await disableDraftMode();
        return new Response('Preview mode disabled', { status: 200 });
    }
    if (secret !== process.env.DATOCMS_PREVIEW_SECRET || !slug)
        return new Response('Invalid token', { status: 401 });
    console.log('Enabling draft mode');
    draftMode().enable();
    if (maxAge) {
        const bypassCookie = cookies().get('__prerender_bypass');
        if (!bypassCookie)
            throw new Error('No bypass cookie found');
        cookies().set(bypassCookie.name, bypassCookie.value, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
            maxAge: parseInt(maxAge)
        });
    }
    redirect(slug);
}
//# sourceMappingURL=draft.js.map