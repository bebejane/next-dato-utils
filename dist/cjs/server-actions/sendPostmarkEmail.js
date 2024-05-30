"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
const postmark_js_1 = require("../utils/postmark.js");
async function sendPostmarkEmailServerAction(prevState, formData) {
    try {
        const subject = formData.get('subject');
        const html = formData.get('html');
        const text = formData.get('text');
        const template = formData.get('template');
        const templateData = {};
        await (0, postmark_js_1.sendPostmarkEmail)({ subject, html, text, template, templateData });
        return { success: true };
    }
    catch (error) {
        console.error(error);
        return { success: false, error: error instanceof Error ? error.message : error };
    }
}
exports.default = sendPostmarkEmailServerAction;
//# sourceMappingURL=sendPostmarkEmail.js.map