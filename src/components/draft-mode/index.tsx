'use server'

import { revalidateTag, revalidatePath, disableDraftMode } from '../../actions'
import DraftModeClient from './DraftModeClient'

type Props = {
  enabled: boolean
  draftUrl?: string,
  tag?: string
  path?: string
}
export default function DraftMode({ enabled, draftUrl, tag, path }: Props) {

  return (
    <DraftModeClient
      enabled={enabled}
      draftUrl={draftUrl}
      tag={tag}
      path={path}
      actions={{ revalidateTag, revalidatePath, disableDraftMode }}
    />
  )
}