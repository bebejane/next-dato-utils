"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function webPreviews(req, generatePreviewUrl) {
    if (!process.env.NEXT_PUBLIC_SITE_URL && !process.env.SITE_URL)
        throw new Error('NEXT_PUBLIC_SITE_URL is not set in .env');
    if (!process.env.DATOCMS_PREVIEW_SECRET)
        throw new Error('DATOCMS_PREVIEW_SECRET is not set in .env');
    const payload = await req.json();
    if (!payload)
        throw new Error('No form data in request body');
    const previewLinks = [];
    let path = await generatePreviewUrl(payload);
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
    const isExternal = path?.startsWith('https://');
    if (isExternal && path) {
        const url = new URL(path);
        baseUrl = url.origin;
        path = url.pathname;
    }
    if (path) {
        previewLinks.push({ label: 'Live', url: `${baseUrl}${path}?secret=${process.env.DATOCMS_PREVIEW_SECRET}` });
        previewLinks.push({ label: 'Draft', url: `${baseUrl}/api/draft?slug=${path}&secret=${process.env.DATOCMS_PREVIEW_SECRET}` });
    }
    return new Response(JSON.stringify({ previewLinks }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
exports.default = webPreviews;
//# sourceMappingURL=web-previews.js.map