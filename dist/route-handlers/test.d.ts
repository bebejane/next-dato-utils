import { PluginAttributes, SiteAttributes, WebhookAttributes } from '@datocms/cma-client/dist/types/generated/RawApiTypes.js';
type PreviewLink = {
    label: string;
    url: string;
};
type RevalidateResponse = {
    revalidated: boolean;
    paths: string[];
    delays: number;
    event_type: string;
};
type Model = {
    model: string;
    previews?: PreviewLink[];
    revalidate?: RevalidateResponse;
};
type TestResult = {
    site: SiteAttributes;
    plugins: PluginAttributes[];
    webhooks: WebhookAttributes[];
    models: Model[];
};
export default function test(req: Request): Promise<Response>;
export declare const renderTestResults: (results: TestResult) => import("react/jsx-runtime").JSX.Element;
export declare function testApiEndpoints(locale: string): Promise<Model[]>;
export {};
