"use strict";
'use server';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidatePath = exports.revalidateTag = exports.disableDraftMode = exports.sendPostmarkEmail = exports.mailchimpNewsletterSignup = exports.campaignMonitorNewsletterSignup = void 0;
const headers_js_1 = require("next/headers.js");
const navigation_js_1 = require("next/navigation.js");
const cache_js_1 = require("next/cache.js");
var campaignMonitorNewsletterSignup_js_1 = require("./campaignMonitorNewsletterSignup.js");
Object.defineProperty(exports, "campaignMonitorNewsletterSignup", { enumerable: true, get: function () { return __importDefault(campaignMonitorNewsletterSignup_js_1).default; } });
var mailchimpNewsletterSignup_js_1 = require("./mailchimpNewsletterSignup.js");
Object.defineProperty(exports, "mailchimpNewsletterSignup", { enumerable: true, get: function () { return __importDefault(mailchimpNewsletterSignup_js_1).default; } });
var sendPostmarkEmail_js_1 = require("./sendPostmarkEmail.js");
Object.defineProperty(exports, "sendPostmarkEmail", { enumerable: true, get: function () { return __importDefault(sendPostmarkEmail_js_1).default; } });
async function disableDraftMode(pathname) {
    (0, headers_js_1.draftMode)().disable();
    (0, navigation_js_1.redirect)(pathname ?? `/`);
}
exports.disableDraftMode = disableDraftMode;
async function revalidateTag(tag) {
    Array.isArray(tag) ? tag.forEach(t => (0, cache_js_1.revalidateTag)(t)) : (0, cache_js_1.revalidateTag)(tag);
}
exports.revalidateTag = revalidateTag;
async function revalidatePath(path) {
    Array.isArray(path) ? path.forEach(p => (0, cache_js_1.revalidatePath)(p)) : (0, cache_js_1.revalidatePath)(path);
}
exports.revalidatePath = revalidatePath;
//# sourceMappingURL=index.js.map