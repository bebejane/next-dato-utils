export type PreviewLink = {
    label: string;
    url: string;
};
export default function webPreviews(req: Request, generatePreviewUrl: (record: any) => Promise<string | null>): Promise<Response>;
