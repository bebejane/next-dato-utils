export default function revalidate(req: Request, callback: (payload: RevalidatePayload, revalidate: (paths: string[], tags: string[]) => Promise<Response>) => Promise<Response>): Promise<Response>;
export type RevalidatePayload = {
    event_type: DatoWebhookPayload['event_type'];
    entity: DatoWebhookPayload['entity'];
    entity_type: DatoWebhookPayload['entity_type'];
    api_key?: string;
};
export type DatoWebhookPayload = {
    environment: string;
    entity_type: 'item' | 'item_type' | 'upload';
    event_type: 'create' | 'update' | 'publish' | 'unpublish' | 'delete';
    entity: {
        id: string;
        type: string;
        attributes: any;
        relationships: {
            item_type: {
                data: {
                    id: string;
                    type: string;
                };
            };
            creator: {
                data: {
                    id: string;
                    type: string;
                };
            };
        };
        meta: {
            created_at: string;
            updated_at: string;
            published_at: string;
            publication_scheduled_at: any;
            unpublishing_scheduled_at: any;
            first_published_at: string;
            is_valid: boolean;
            is_current_version_valid: boolean;
            is_published_version_valid: boolean;
            status: string;
            current_version: string;
            stage: any;
        };
    };
    related_entities: Array<{
        id: string;
        type: string;
        attributes: {
            name: string;
            singleton: boolean;
            sortable: boolean;
            api_key: string;
            ordering_direction: any;
            ordering_meta: any;
            tree: boolean;
            modular_block: boolean;
            draft_mode_active: boolean;
            all_locales_required: boolean;
            collection_appeareance: string;
            collection_appearance: string;
            has_singleton_item: boolean;
            hint: any;
            inverse_relationships_enabled: boolean;
        };
        relationships: {
            fields: {
                data: Array<{
                    id: string;
                    type: string;
                }>;
            };
            fieldsets: {
                data: Array<any>;
            };
            singleton_item: {
                data: {
                    id: string;
                    type: string;
                };
            };
            ordering_field: {
                data: any;
            };
            title_field: {
                data: {
                    id: string;
                    type: string;
                };
            };
            image_preview_field: {
                data: any;
            };
            excerpt_field: {
                data: any;
            };
            workflow: {
                data: any;
            };
        };
        meta: {
            has_singleton_item: boolean;
        };
    }>;
};
