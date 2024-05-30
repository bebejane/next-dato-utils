export default function sendPostmarkEmailServerAction(prevState: any, formData: FormData): Promise<{
    success: boolean;
    error?: string;
}>;
