"use strict";
'use server';
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const postmark = __importStar(require("postmark"));
async function sendPostmarkEmail(prevState, formData) {
    try {
        if (!process.env.POSTMARK_API_TOKEN)
            throw new Error('POSTMARK_API_TOKEN is not set');
        if (!process.env.POSTMARK_FROM_EMAIL)
            throw new Error('POSTMARK_FROM_EMAIL is not set');
        if (!process.env.POSTMARK_FROM_NAME)
            throw new Error('POSTMARK_FROM_NAME is not set');
        const email = formData.get('email');
        const template = formData.get('template');
        const templateData = formData.get('template_data') ? JSON.parse(formData.get('template_data')) : {};
        try {
            zod_1.z.string().email({ message: "Invalid e-mail address" }).parse(email);
        }
        catch (e) {
            throw new Error("Invalid e-mail address");
        }
        const postmarkClient = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);
        const res = await postmarkClient.sendEmailWithTemplate({
            From: process.env.POSTMARK_FROM_EMAIL,
            To: email,
            TemplateAlias: template ?? undefined,
            TemplateModel: templateData ?? undefined
        });
        if (res.ErrorCode)
            throw new Error(`There was an error sending the email. (${res.ErrorCode}) ${res.Message}`);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : error };
    }
}
exports.default = sendPostmarkEmail;
//# sourceMappingURL=sendPostmarkEmail.js.map