import { DatoCmsConfig } from '../config';
export default function assetManager(req: Request, config: DatoCmsConfig): Promise<Response>;
export declare function resizeImage(asset: Asset, config: AssetConfig): Promise<{
    newFilePath: string;
    newFilename: string;
    buffer: Buffer<ArrayBufferLike>;
}>;
export type AssetConfig = {
    maxWidth: number;
    maxHeight: number;
    maxSize: number;
    quality: number;
};
export type WebookEvent = {
    webhook_call_id: string;
    event_triggered_at: string;
    attempted_auto_retries_count: number;
    webhook_id: string;
    site_id: string;
    environment: string;
    is_environment_primary: boolean;
    entity_type: string;
    event_type: string;
    entity: {
        id: string;
        type: string;
        attributes: Asset;
        relationships: {
            creator: {
                data: {
                    id: string;
                    type: string;
                };
            };
            upload_collection: {
                data: any;
            };
        };
    };
    related_entities: Array<any>;
};
export type Asset = {
    size: number;
    width: number;
    height: number;
    path: string;
    format: string;
    author: any;
    notes: any;
    copyright: any;
    default_field_metadata: {
        sv: {
            alt: any;
            title: string;
            custom_data: {};
            focal_point: any;
        };
        en: {
            alt: any;
            title: any;
            custom_data: {};
            focal_point: any;
        };
    };
    is_image: boolean;
    created_at: string;
    updated_at: string;
    url: string;
    tags: Array<any>;
    filename: string;
    basename: string;
    exif_info: {};
    mime_type: string;
    colors: Array<{
        red: number;
        green: number;
        blue: number;
        alpha: number;
    }>;
    smart_tags: Array<string>;
    duration: any;
    frame_rate: any;
    mux_playback_id: any;
    blurhash: string;
    thumbhash: string;
    mux_mp4_highest_res: any;
    md5: string;
};
