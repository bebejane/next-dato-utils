'use server'
import { draftMode } from 'next/headers'
import { revalidateTag, revalidatePath, disableDraftMode } from '../../actions'
import DraftModeClient from './DraftModeClient'

type Props = {
  url?: string,
  tag?: string
  path?: string
}
export default async function DraftMode({ url, tag, path }: Props) {

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