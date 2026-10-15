'use server';
import { signupCampaignMonitorNewsletter } from '../utils';
export default async function campaignMonitorNewsletterSignup(prevState, formData) {
    const email = formData.get('email');
    try {
        await signupCampaignMonitorNewsletter(email);
        return { success: true };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : error,
            email,
        };
    }
}
//# sourceMappingURL=campaignMonitorNewsletterSignup.js.map