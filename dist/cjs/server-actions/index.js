"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidatePath = exports.revalidateTag = exports.disableDraftMode = void 0;
const headers_1 = require("next/headers");
const navigation_1 = require("next/navigation");
const cache_1 = require("next/cache");
async function disableDraftMode(pathname) {
    console.log('disableDraftMode', pathname);
    (0, headers_1.draftMode)().disable();
    (0, navigation_1.redirect)(pathname ?? `/`);
}
exports.disableDraftMode = disableDraftMode;
async function revalidateTag(tag) {
    return (0, cache_1.revalidateTag)(tag);
}
exports.revalidateTag = revalidateTag;
async function revalidatePath(path) {
    return (0, cache_1.revalidatePath)(path);
}
exports.revalidatePath = revalidatePath;
//# sourceMappingURL=index.js.map