import { MetadataRoute } from 'next';
export type DatoCmsConfig = {
    route?: (record: any, locale?: string | null) => Promise<string | null>;
    routes: {
        [api_key: string]: (record: any, locale?: string | null) => Promise<string[] | null>;
        upload: (record: any) => Promise<string[] | null>;
    };
    manifest?: (props?: any) => Promise<MetadataRoute.Manifest>;
    sitemap?: (props?: any) => Promise<MetadataRoute.Sitemap>;
    robots?: (props?: any) => Promise<MetadataRoute.Robots>;
    webPreviews?: (record: any) => Promise<string | null>;
    i18n?: {
        locales: string[];
        defaultLocale: string;
    };
    tenancy?: {
        main: string;
        tenants: string[];
    };
};
