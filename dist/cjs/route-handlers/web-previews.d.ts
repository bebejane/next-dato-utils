import { NextRequest } from "next/server";
export type PreviewLink = {
    label: string;
    url: string;
};
export default function webPreviews(req: NextRequest, generatePreviewUrl: (record: any) => Promise<string | null>): Promise<Response>;
