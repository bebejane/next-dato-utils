"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = draft;
const headers_js_1 = require("next/headers.js");
const navigation_js_1 = require("next/navigation.js");
const headers_js_2 = require("next/headers.js");
async function draft(request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const slug = searchParams.get('slug');
    const maxAge = searchParams.get('max-age');
    const exit = searchParams.get('exit');
    if (secret !== process.env.DATOCMS_PREVIEW_SECRET)
        return new Response('Invalid token', { status: 401 });
    if (exit !== null) {
        (await (0, headers_js_1.draftMode)()).disable();
    }
    else {
        (await (0, headers_js_1.draftMode)()).enable();
    }
    if (maxAge) {
        const bypassCookie = (await (0, headers_js_2.cookies)()).get('__prerender_bypass');
        if (!bypassCookie) {
            throw new Error('No bypass cookie found');
        }
        (await (0, headers_js_2.cookies)()).set(bypassCookie.name, bypassCookie.value, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
            maxAge: parseInt(maxAge)
        });
    }
    if (slug)
        (0, navigation_js_1.redirect)(slug);
    else
        return new Response('OK', { status: 200 });
}
//# sourceMappingURL=draft.js.map