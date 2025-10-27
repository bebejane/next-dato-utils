import { MetadataRoute } from 'next';

export type DatoCmsConfig = {
	i18n?: {
		locales: string[];
		defaultLocale: string;
	};
	routes: {
		[api_key: string]: (record: any, locale?: string) => Promise<string[] | null>;
	};
	manifest?: () => Promise<MetadataRoute.Manifest>;
	sitemap?: () => Promise<MetadataRoute.Sitemap>;
	robots?: () => Promise<MetadataRoute.Robots>;
};
