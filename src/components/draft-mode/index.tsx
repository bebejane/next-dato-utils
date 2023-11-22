'use server'

import { draftMode } from 'next/headers.js'
import { revalidateTag, revalidatePath, disableDraftMode } from '../../server-actions/index.js'
import DraftModeClient from './DraftModeClient.js'

export type Props = {
  url?: string | undefined | null,
  tag?: string | string[] | undefined | null
  path?: string | string[] | undefined | null
}

export default async function DraftMode({ url, tag, path }: Props) {

  if (!url || (!tag && !path)) return null

  return (
    <DraftModeClient
      enabled={draftMode().isEnabled}
      draftUrl={url}
      tag={tag}
      path={path}
      actions={{ revalidateTag, revalidatePath, disableDraftMode }}
    />
  )
}