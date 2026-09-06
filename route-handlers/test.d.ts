import { PluginAttributes, SiteAttributes, WebhookAttributes } from '@datocms/cma-client/dist/types/generated/RawApiTypes.js';
import React from 'react';
import { RevalidateResult, WebPreviewResult } from '../tests/endpoints.js';
type TestResult = {
    site: SiteAttributes;
    plugins: PluginAttributes[];
    webhooks: WebhookAttributes[];
    endpoints: {
        revalidate: RevalidateResult;
        preview: WebPreviewResult;
    }[];
};
export default function test(req: Request): Promise<Response>;
export declare const renderTestResults: (results: TestResult) => React.JSX.Element;
export {};
