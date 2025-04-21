"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableDraftMode = disableDraftMode;
exports.revalidateTag = revalidateTag;
exports.revalidatePath = revalidatePath;
const headers_js_1 = require("next/headers.js");
const navigation_js_1 = require("next/navigation.js");
const cache_js_1 = require("next/cache.js");
async function disableDraftMode(pathname) {
    (await (0, headers_js_1.draftMode)()).disable();
    (0, navigation_js_1.redirect)(pathname ?? `/`);
}
async function revalidateTag(tag) {
    Array.isArray(tag) ? tag.forEach(t => (0, cache_js_1.revalidateTag)(t)) : (0, cache_js_1.revalidateTag)(tag);
}
async function revalidatePath(path) {
    Array.isArray(path) ? path.forEach(p => (0, cache_js_1.revalidatePath)(p)) : (0, cache_js_1.revalidatePath)(path);
}
//# sourceMappingURL=index.js.map