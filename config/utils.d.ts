import 'dotenv/config';
import type { DatoCmsConfig } from './config.js';
export declare function getItemReferenceRoutes(itemId: string, routes: DatoCmsConfig['routes'], locales?: string[]): Promise<string[] | null>;
export declare function getUploadReferenceRoutes(uploadId: string, routes: DatoCmsConfig['routes'], locales?: string[]): Promise<string[] | null>;
export declare function getItemWithLinked(id: string): Promise<any>;
