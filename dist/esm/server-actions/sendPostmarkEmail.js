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
        const template = formData.get('template');
        const templateData = formData.get('template_data') ? JSON.parse(formData.get('template_data')) : {};
        try {
            z.string().email({ message: "Invalid e-mail address" }).parse(email);
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
//# sourceMappingURL=sendPostmarkEmail.js.map