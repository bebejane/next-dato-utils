export type WebPreview = {
    label: string;
    url: string;
};
export type WebPreviewResult = {
    links: WebPreview[];
    api_key: string;
    locale: string;
    item: any;
};
export type RevalidateResult = {
    revalidated: boolean;
    paths: string[];
    delays: number;
    event_type: string;
    item: any;
    api_key: string;
    locale: string;
};
export declare const baseApiUrl: string;
export declare const testWebPreviewsEndpoint: (api_key: string, locale: string) => Promise<WebPreviewResult>;
export declare const testRevalidateEndpoint: (api_key: string, locale: string) => Promise<RevalidateResult>;
export declare function testAllEndpoints(locale: string, limit?: number): Promise<{
    revalidate: RevalidateResult;
    preview: WebPreviewResult;
}[]>;
