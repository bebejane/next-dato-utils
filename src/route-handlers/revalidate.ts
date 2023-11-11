import { revalidatePath, revalidateTag } from "next/cache";
//import basicAuth from "./basic-auth";

export default async function revalidate(req: Request, callback: (payload: RevalidatePayload, revalidate: (paths: string[], tags: string[]) => Promise<Response>) => Promise<Response>) {

  const payload = await req.json() as DatoWebhookPayload

  if (!payload || !payload?.entity)
    return new Response('Payload empty or missing entity', { status: 400 })

  const { entity, related_entities, event_type } = payload
  const api_key = related_entities.find(({ id }) => id === entity.relationships?.item_type?.data?.id)?.attributes?.api_key

  if (!api_key)
    return new Response('Model api_key not found in payload', { status: 400 })

  const transformedPayload: RevalidatePayload = { entity, event_type, api_key }
  const delay = Date.now() - Math.max(new Date(entity.meta.updated_at).getTime(), new Date(entity.meta.published_at).getTime(), new Date(entity.meta.created_at).getTime())
  const now = Date.now()
  const response = { revalidated: false, event_type, api_key, delay, now }

  return await callback(transformedPayload, async (paths, tags) => {
    try {
      if ((!paths && !tags) || (!paths.length && !tags.length))
        return new Response(JSON.stringify(response), { status: 200, headers: { 'content-type': 'application/json' } })

      paths?.forEach(p => revalidatePath(p))
      tags?.forEach(t => revalidateTag(t))

      return new Response(JSON.stringify({ ...response, revalidated: true, paths, tags }), { status: 200, headers: { 'content-type': 'application/json' } })
    } catch (error) {
      console.log('Error revalidating', paths, tags)
      console.error(error)
      return new Response(JSON.stringify({ ...response, paths, tags, error }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
  })
}

export type RevalidatePayload = {
  event_type: DatoWebhookPayload['event_type']
  entity: DatoWebhookPayload['entity']
  api_key: string
}

export type DatoWebhookPayload = {
  environment: string
  entity_type: string
  event_type: 'create' | 'update' | 'publish' | 'unpublish' | 'delete'
  entity: {
    id: string
    type: string
    attributes: any,
    relationships: {
      item_type: {
        data: {
          id: string
          type: string
        }
      }
      creator: {
        data: {
          id: string
          type: string
        }
      }
    }
    meta: {
      created_at: string
      updated_at: string
      published_at: string
      publication_scheduled_at: any
      unpublishing_scheduled_at: any
      first_published_at: string
      is_valid: boolean
      is_current_version_valid: boolean
      is_published_version_valid: boolean
      status: string
      current_version: string
      stage: any
    }
  }
  related_entities: Array<{
    id: string
    type: string
    attributes: {
      name: string
      singleton: boolean
      sortable: boolean
      api_key: string
      ordering_direction: any
      ordering_meta: any
      tree: boolean
      modular_block: boolean
      draft_mode_active: boolean
      all_locales_required: boolean
      collection_appeareance: string
      collection_appearance: string
      has_singleton_item: boolean
      hint: any
      inverse_relationships_enabled: boolean
    }
    relationships: {
      fields: {
        data: Array<{
          id: string
          type: string
        }>
      }
      fieldsets: {
        data: Array<any>
      }
      singleton_item: {
        data: {
          id: string
          type: string
        }
      }
      ordering_field: {
        data: any
      }
      title_field: {
        data: {
          id: string
          type: string
        }
      }
      image_preview_field: {
        data: any
      }
      excerpt_field: {
        data: any
      }
      workflow: {
        data: any
      }
    }
    meta: {
      has_singleton_item: boolean
    }
  }>
}