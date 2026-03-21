import { MetadataRoute } from 'next';

export type DatoCmsConfig = {
	i18n?: {
		locales: string[];
		defaultLocale: string;
	};
	routes: {
		[api_key: string]: (record: any, locale?: string) => Promise<string[] | null>;
	};
	route: (record: any, locale?: string) => Promise<string | null>;
	manifest?: (props?: any) => Promise<MetadataRoute.Manifest>;
	sitemap?: (props?: any) => Promise<MetadataRoute.Sitemap>;
	robots?: (props?: any) => Promise<MetadataRoute.Robots>;
};
