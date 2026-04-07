import { DatoCmsConfig } from '../config';
import { Upload } from '@datocms/cma-client/dist/types/generated/ApiTypes';
export declare function resizeAndUpload(upload: Upload, config: DatoCmsConfig): Promise<{
    success: boolean;
    id: string;
    size: string;
    original: string;
    reduction: string;
    filename: string;
    newFilename: string;
    replaceStrategy: string;
    duration: number;
} | null>;
export declare function isValidateForResize(upload: Upload, config: DatoCmsConfig): boolean;
export declare function resizeImage(upload: Upload, config: DatoCmsConfig): Promise<{
    newFilePath: string;
    newFilename: string;
    buffer: Buffer<ArrayBufferLike>;
}>;
