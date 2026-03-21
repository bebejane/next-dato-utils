import { MetadataRoute } from 'next';

export type DatoCmsConfig = {
	i18n?: {
		locales: string[];
		defaultLocale: string;
	};
	route: (record: any, locale: string | undefined | null) => Promise<string | null>;
	routes: {
		[api_key: string]: (
			record: any,
			locale?: string | undefined | null,
			main?: boolean,
		) => Promise<typeof main extends true ? string | null : string[] | null>;
		upload: (record: any) => Promise<string[] | null>;
	};
	manifest?: (props?: any) => Promise<MetadataRoute.Manifest>;
	sitemap?: (props?: any) => Promise<MetadataRoute.Sitemap>;
	robots?: (props?: any) => Promise<MetadataRoute.Robots>;
};

export async function getRoute(
	record: any,
	locale: string | undefined | null,
	config: DatoCmsConfig,
) {
	const key = record._modelApiKey as keyof DatoCmsConfig['routes'];
	const routes = await config.routes[key]?.(record, locale, true);
	return routes?.[0] ?? null;
}
