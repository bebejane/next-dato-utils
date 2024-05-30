'use server';
import { sendPostmarkEmail } from '../utils/postmark.js';
export default async function sendPostmarkEmailServerAction(prevState, formData) {
    try {
        const subject = formData.get('subject');
        const html = formData.get('html');
        const text = formData.get('text');
        const template = formData.get('template');
        const templateData = {};
        await sendPostmarkEmail({ subject, html, text, template, templateData });
        return { success: true };
    }
    catch (error) {
        console.error(error);
        return { success: false, error: error instanceof Error ? error.message : error };
    }
}
//# sourceMappingURL=sendPostmarkEmail.js.map