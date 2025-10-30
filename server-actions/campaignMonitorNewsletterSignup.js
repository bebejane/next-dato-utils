'use server';
import { z } from 'zod';
export default async function campaignMonitorNewsletterSignup(prevState, formData) {
    const email = formData.get('email');
    try {
        if (!process.env.CAMPAIGN_MONITOR_API_KEY || !process.env.CAMPAIGN_MONITOR_LIST_ID)
            throw new Error('Newsletter signup is not configured');
        try {
            z.string()
                .email({ message: 'Invalid e-mail address' })
                .parse(email);
        }
        catch (e) {
            throw new Error('Invalid e-mail address');
        }
        const apiEndpoint = 'https://api.createsend.com/api/v3.3';
        const signupEndpoint = `${apiEndpoint}/subscribers/${process.env.CAMPAIGN_MONITOR_LIST_ID}.json`;
        const basicAuth = btoa(`${process.env.CAMPAIGN_MONITOR_API_KEY}:`);
        const response = await fetch(signupEndpoint, {
            body: JSON.stringify({
                EmailAddress: email,
                Name: '',
                Resubscribe: false,
                RestartSubscriptionBasedAutoresponders: true,
                ConsentToTrack: 'Yes',
            }),
            method: 'POST',
            cache: 'no-store',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        if (!response.ok)
            throw new Error(data.Message);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : error, email };
    }
}
//# sourceMappingURL=campaignMonitorNewsletterSignup.js.map