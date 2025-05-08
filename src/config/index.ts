import { MetadataRoute } from 'next';
import { cosmiconfig } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
export { GET, POST } from './routes';

export type DatoCmsConfig = {
  name: string
  description: string
  theme: {
    color: string
    background: string
  }
  url: {
    dev: string
    public: string
  }
  i18n?: {
    locales: string[]
    defaultLocale: string
  }
  routes: {
    [api_key: string]: (record: any, locale?: string) => Promise<string[] | null>
  },
  sitemap?: () => Promise<MetadataRoute.Sitemap>
}

export const getDatoCmsConfig = async (path?: string): Promise<DatoCmsConfig> => {

  try {
    const importPath = `${path ?? '../../../..'}/datocms.config`
    console.log('load config', process.cwd(), importPath)
    const config = (await import(importPath)).default;
    console.log(config)
    return config as DatoCmsConfig;
  } catch (e) {
    throw new Error('No datocms.config.ts found or it is empty.');
  }
}
export const getDatoCmsConfig2 = async (): Promise<DatoCmsConfig> => {

  const explorer = cosmiconfig('datocms', {
    searchPlaces: ['datocms.config.ts', 'datocms.config.json'], // Explicitly search for the TS file 
    loaders: { '.ts': TypeScriptLoader() },
  });

  const res = await explorer.load("./datocms.config.ts");
  if (!res?.config) {
    throw new Error('No datocms.config.ts found or it is empty.');
  }
  console.log(res.config)
  // The config object is nested under the 'config' property
  return res.config as DatoCmsConfig;
}


export const getRoute = async (record: any, locale?: string): Promise<string[] | null> => {
  const config = await getDatoCmsConfig()
  if (!config?.routes?.[record?.api_key]) throw new Error(`No route found for ${record.api_key}`)
  return config.routes[record.api_key](record, locale)
}
