export type Props = {
    subject: string;
    to?: string;
    html?: string;
    text?: string;
    template?: string;
    templateData?: any;
};
export declare function sendPostmarkEmail({ to, subject, html, text, template, templateData }: Props): Promise<{
    success: boolean;
    error?: string;
}>;
