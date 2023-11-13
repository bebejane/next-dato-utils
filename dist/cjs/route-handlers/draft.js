"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
const headers_1 = require("next/headers");
const navigation_1 = require("next/navigation");
const headers_2 = require("next/headers");
const server_actions_1 = require("../server-actions");
async function draft(request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const slug = searchParams.get('slug');
    const maxAge = searchParams.get('max-age');
    const exit = searchParams.get('exit');
    if (exit === 'true') {
        console.log('Disabling draft mode');
        await (0, server_actions_1.disableDraftMode)();
        return new Response('Preview mode disabled', { status: 200 });
    }
    if (secret !== process.env.DATOCMS_PREVIEW_SECRET || !slug)
        return new Response('Invalid token', { status: 401 });
    console.log('Enabling draft mode');
    (0, headers_1.draftMode)().enable();
    if (maxAge) {
        const bypassCookie = (0, headers_2.cookies)().get('__prerender_bypass');
        if (!bypassCookie)
            throw new Error('No bypass cookie found');
        (0, headers_2.cookies)().set(bypassCookie.name, bypassCookie.value, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
            maxAge: parseInt(maxAge)
        });
    }
    (0, navigation_1.redirect)(slug);
}
exports.default = draft;
//# sourceMappingURL=draft.js.map