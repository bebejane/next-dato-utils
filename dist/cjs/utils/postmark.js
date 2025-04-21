"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPostmarkEmail = sendPostmarkEmail;
const zod_1 = require("zod");
const postmark = __importStar(require("postmark"));
async function sendPostmarkEmail({ to, subject, html, text, template, templateData }) {
    try {
        if (!process.env.POSTMARK_API_TOKEN)
            throw new Error('POSTMARK_API_TOKEN is not set');
        if (!process.env.POSTMARK_FROM_EMAIL)
            throw new Error('POSTMARK_FROM_EMAIL is not set');
        if (!process.env.POSTMARK_FROM_NAME)
            throw new Error('POSTMARK_FROM_NAME is not set');
        const isTemplateEmail = typeof template === 'string';
        try {
            if (!isTemplateEmail) {
                zod_1.z.string().min(1).parse(subject);
                zod_1.z.string().min(1).parse(text);
            }
        }
        catch (e) {
            throw new Error("Missing subject or text field");
        }
        try {
            if (to) {
                zod_1.z.string().email().parse(to);
            }
        }
        catch (e) {
            throw new Error("Invalid To e-mail address");
        }
        const postmarkClient = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);
        const res = isTemplateEmail ?
            await postmarkClient.sendEmailWithTemplate({
                From: process.env.POSTMARK_FROM_EMAIL,
                To: to || process.env.POSTMARK_FROM_EMAIL,
                TemplateAlias: template,
                TemplateModel: templateData ?? {}
            }) : await postmarkClient.sendEmail({
            From: process.env.POSTMARK_FROM_EMAIL,
            To: to || process.env.POSTMARK_FROM_EMAIL,
            Subject: subject,
            HtmlBody: html,
            TextBody: text
        });
        if (res.ErrorCode) {
            throw new Error(`There was an error sending the email. (${res.ErrorCode}) ${res.Message}`);
        }
        return { success: true };
    }
    catch (error) {
        console.error(error);
        return { success: false, error: error instanceof Error ? error.message : error };
    }
}
//# sourceMappingURL=postmark.js.map