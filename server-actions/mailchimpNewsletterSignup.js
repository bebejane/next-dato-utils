'use server';
import { z } from 'zod';
export default async function mailchimpNewsletterSignup(prevState, formData) {
    try {
        if (!process.env.MAILCHIMP_AUDIENCE_ID)
            throw new Error('MAILCHIMP_AUDIENCE_ID is not set');
        if (!process.env.MAILCHIMP_API_KEY)
            throw new Error('MAILCHIMP_API_KEY is not set');
        if (!process.env.MAILCHIMP_API_SERVER)
            throw new Error('MAILCHIMP_API_SERVER is not set');
        const email = formData.get('email');
        try {
            z.string().email({ message: "Invalid email address" }).parse(email);
        }
        catch (e) {
            throw new Error("Invalid email address");
        }
        const data = { email_address: email, status: 'subscribed' };
        const response = await fetch(`https://${process.env.MAILCHIMP_API_SERVER}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_AUDIENCE_ID}/members`, {
            body: JSON.stringify(data),
            method: 'POST',
            cache: 'no-store',
            headers: {
                'Authorization': `apikey ${process.env.MAILCHIMP_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        const { title, status, detail } = await response.json();
        if (status >= 400) {
            const exists = title?.toLowerCase().includes('exists') ?? false;
            if (!exists) {
                console.log('Mailchimp error', status, title, detail);
                throw new Error('There was an error signing up for the newsletter. Please try again later.');
            }
        }
        return { success: true };
    }
    catch (e) {
        console.log(e);
        return { error: e instanceof Error ? e.message : e, success: false };
    }
}
//# sourceMappingURL=mailchimpNewsletterSignup.js.map