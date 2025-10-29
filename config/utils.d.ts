import 'dotenv/config';
import { DatoCmsConfig } from './config.js';
export declare function getItemReferenceRoutes(itemId: string, locales?: string[]): Promise<string[] | null>;
export declare function getUploadReferenceRoutes(uploadId: string, locales?: string[]): Promise<string[] | null>;
export declare function getItemWithLinked(id: string): Promise<any>;
export declare function loadConfig(): Promise<DatoCmsConfig>;
