import { cosmiconfig } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
export { GET, POST } from './routes';
export const getDatoCmsConfig = async () => {
    try {
        console.log('load config', process.cwd());
        //@ts-expect-error
        const config = (await import('../../../datocms.config')).default;
        console.log(config);
        return config;
    }
    catch (e) {
        throw new Error('No datocms.config.ts found or it is empty.');
    }
};
export const getDatoCmsConfig2 = async () => {
    const explorer = cosmiconfig('datocms', {
        searchPlaces: ['datocms.config.ts', 'datocms.config.json'], // Explicitly search for the TS file 
        loaders: { '.ts': TypeScriptLoader() },
    });
    const res = await explorer.load("./datocms.config.ts");
    if (!res?.config) {
        throw new Error('No datocms.config.ts found or it is empty.');
    }
    console.log(res.config);
    // The config object is nested under the 'config' property
    return res.config;
};
export const getRoute = async (record, locale) => {
    const config = await getDatoCmsConfig();
    if (!config?.routes?.[record?.api_key])
        throw new Error(`No route found for ${record.api_key}`);
    return config.routes[record.api_key](record, locale);
};
//# sourceMappingURL=index.js.map