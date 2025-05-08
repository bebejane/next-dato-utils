import { MetadataRoute } from 'next';
export { default as router } from './router';
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
