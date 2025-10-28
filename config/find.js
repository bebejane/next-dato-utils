import { getTsconfig } from 'get-tsconfig';
import path from 'path';
import { findUpSync } from './findUp.js';
/**
 * List of all filenames to detect as a DatoCms configuration file.
 */
export const datocmsConfigFileNames = ['datocms.config.js', 'datocms.config.ts'];
/**
 * Returns the source and output paths from the nearest tsconfig.json file.
 * If no tsconfig.json file is found, returns the current working directory.
 * @returns An object containing the source and output paths.
 */
export const getTSConfigPaths = () => {
    const tsConfigResult = getTsconfig();
    const tsConfig = tsConfigResult.config;
    const tsConfigDir = path.dirname(tsConfigResult.path);
    try {
        const rootConfigDir = path.resolve(tsConfigDir, tsConfig.compilerOptions.baseUrl || '');
        const srcPath = tsConfig.compilerOptions?.rootDir || path.resolve(process.cwd(), 'src');
        const outPath = tsConfig.compilerOptions?.outDir || path.resolve(process.cwd(), 'dist');
        let configPath = tsConfig.compilerOptions?.paths?.['@datocms-config']?.[0];
        if (configPath) {
            configPath = path.resolve(rootConfigDir, configPath);
        }
        return {
            configPath,
            outPath,
            rootPath: rootConfigDir,
            srcPath,
            tsConfigPath: tsConfigResult.path,
        };
    }
    catch (error) {
        console.error(`Error parsing tsconfig.json: ${error}`); // Do not throw the error, as we can still continue with the other config path finding methods
        return {
            rootPath: process.cwd(),
        };
    }
};
/**
 * Searches for a DatoCms configuration file.
 * @returns The absolute path to the DatoCms configuration file.
 * @throws An error if no configuration file is found.
 */
export const findConfig = () => {
    const { configPath, outPath, rootPath, srcPath } = getTSConfigPaths();
    // if configPath is absolute file, not folder, return it
    if (configPath && (path.extname(configPath) === '.js' || path.extname(configPath) === '.ts')) {
        return configPath;
    }
    const searchPaths = process.env.NODE_ENV === 'production' ? [configPath, outPath, srcPath, rootPath] : [configPath, srcPath, rootPath];
    for (const searchPath of searchPaths) {
        if (!searchPath) {
            continue;
        }
        const configPath = findUpSync({
            dir: searchPath,
            fileNames: datocmsConfigFileNames,
        });
        if (configPath) {
            return configPath;
        }
    }
    // If no config file is found in the directories defined by tsconfig.json,
    // try searching in the 'src' and 'dist' directory as a last resort, as they are most commonly used
    if (process.env.NODE_ENV === 'production') {
        const distConfigPath = findUpSync({
            dir: path.resolve(process.cwd(), 'dist'),
            fileNames: ['datocms.config.js'],
        });
        if (distConfigPath) {
            return distConfigPath;
        }
    }
    else {
        const srcConfigPath = findUpSync({
            dir: path.resolve(process.cwd(), 'src'),
            fileNames: datocmsConfigFileNames,
        });
        if (srcConfigPath) {
            return srcConfigPath;
        }
    }
    throw new Error('Error: cannot find DatoCms config. Please create a configuration file located at the root of your current working directory called "datocms.config.js" or "datocms.config.ts".');
};
//# sourceMappingURL=find.js.map