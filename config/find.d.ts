/**
 * List of all filenames to detect as a DatoCms configuration file.
 */
export declare const datocmsConfigFileNames: string[];
/**
 * Returns the source and output paths from the nearest tsconfig.json file.
 * If no tsconfig.json file is found, returns the current working directory.
 * @returns An object containing the source and output paths.
 */
export declare const getTSConfigPaths: () => {
    configPath?: string;
    outPath?: string;
    rootPath?: string;
    srcPath?: string;
    tsConfigPath?: string;
};
/**
 * Searches for a DatoCms configuration file.
 * @returns The absolute path to the DatoCms configuration file.
 * @throws An error if no configuration file is found.
 */
export declare const findConfig: () => string;
