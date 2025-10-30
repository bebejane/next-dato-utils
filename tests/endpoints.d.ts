export type WebPreview = {
    label: string;
    url: string;
};
export type WebPreviewResult = {
    links: WebPreview[];
    api_key: string;
    locale: string;
    itemId: string;
    itemTypeId: string;
} | null;
export type RevalidateResult = {
    revalidated: boolean;
    paths: string[];
    delays: number;
    event_type: string;
    api_key: string;
    locale: string;
    itemId: string;
    itemTypeId: string | null | undefined;
} | null;
export declare const baseApiUrl: string;
export declare const testWebPreviewsEndpoint: (api_key: string, locale: string) => Promise<WebPreviewResult>;
export declare const testRevalidateEndpoint: (api_key: string, locale: string) => Promise<RevalidateResult>;
export declare const testRevalidateUploadEndpoint: () => Promise<{
    revalidate: RevalidateResult | null;
    preview: WebPreviewResult | null;
}>;
export declare function testAllEndpoints(locale: string, limit?: number): Promise<{
    revalidate: RevalidateResult;
    preview: WebPreviewResult;
}[]>;
