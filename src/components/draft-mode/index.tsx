'use server'
import { draftMode } from 'next/headers'
import { revalidateTag, revalidatePath, disableDraftMode } from '../../actions'
import DraftModeClient from './DraftModeClient'

type Props = {
  enabled: boolean
  draftUrl?: string,
  tag?: string
  path?: string
}
export default async function DraftMode({ draftUrl, tag, path }: Props) {

  return (
    <DraftModeClient
      enabled={draftMode().isEnabled}
      draftUrl={draftUrl}
      tag={tag}
      path={path}
      actions={{ revalidateTag, revalidatePath, disableDraftMode }}
    />
  )
}