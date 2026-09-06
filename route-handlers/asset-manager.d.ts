import { DatoCmsConfig } from '../config';
import { Upload } from '@datocms/cma-client/dist/types/generated/ApiTypes';
export default function assetManager(req: Request, config: DatoCmsConfig): Promise<Response>;
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
        attributes: Upload;
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
