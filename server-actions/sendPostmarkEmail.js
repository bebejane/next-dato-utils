'use server';
import { z } from 'zod';
import * as postmark from 'postmark';
export default async function sendPostmarkEmail(prevState, formData) {
    try {
        if (!process.env.POSTMARK_API_TOKEN)
            throw new Error('POSTMARK_API_TOKEN is not set');
        if (!process.env.POSTMARK_FROM_EMAIL)
            throw new Error('POSTMARK_FROM_EMAIL is not set');
        if (!process.env.POSTMARK_FROM_NAME)
            throw new Error('POSTMARK_FROM_NAME is not set');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const html = formData.get('html');
        const text = formData.get('text');
        const template = formData.get('template');
        const templateData = formData.get('template_data') ? JSON.parse(formData.get('template_data')) : {};
        const isTemplateEmail = typeof template === 'string';
        try {
            z.string().email({ message: "Invalid e-mail address" }).parse(email);
            if (!isTemplateEmail) {
                z.string().min(1).parse(subject);
                z.string().min(1).parse(text);
            }
        }
        catch (e) {
            throw new Error("Invalid e-mail address");
        }
        const postmarkClient = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);
        const res = isTemplateEmail ?
            await postmarkClient.sendEmailWithTemplate({
                From: process.env.POSTMARK_FROM_EMAIL,
                To: email,
                TemplateAlias: template,
                TemplateModel: templateData ?? {}
            }) : await postmarkClient.sendEmail({
            From: process.env.POSTMARK_FROM_EMAIL,
            To: email,
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
//# sourceMappingURL=sendPostmarkEmail.js.map