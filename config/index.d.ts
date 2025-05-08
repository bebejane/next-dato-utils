import { MetadataRoute } from 'next';
export type DatoCmsConfig = {
    name: string;
    description: string;
    theme: {
        color: string;
        background: string;
    };
    url: {
        dev: string;
        public: string;
    };
    i18n?: {
        locales: string[];
        defaultLocale: string;
    };
    routes: {
        [api_key: string]: (record: any, locale?: string) => Promise<string[] | null>;
    };
    sitemap?: () => Promise<MetadataRoute.Sitemap>;
};
export declare const getDatoCmsConfig: () => Promise<DatoCmsConfig>;
export declare const getDatoCmsConfig2: () => Promise<DatoCmsConfig>;
export declare const getRoute: (record: any, locale?: string) => Promise<string[] | null>;
