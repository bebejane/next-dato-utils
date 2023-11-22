'use server'

import { draftMode } from 'next/headers.js'
import { revalidateTag, revalidatePath, disableDraftMode } from '../../server-actions/index.js'
import DraftModeClient from './DraftModeClient.js'

export type Props = {
  url?: string | undefined | null,
  tag?: string
  path?: string
}

export default async function DraftMode({ url, tag, path }: Props) {

  if (!url) return null

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