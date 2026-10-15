'use server';

import { signupCampaignMonitorNewsletter } from '../utils';

export default async function campaignMonitorNewsletterSignup(
	prevState: any,
	formData: FormData,
): Promise<{ success: boolean; error?: string; email?: string }> {
	const email = formData.get('email') as string;

	try {
		await signupCampaignMonitorNewsletter(email);
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : (error as string),
			email,
		};
	}
}
