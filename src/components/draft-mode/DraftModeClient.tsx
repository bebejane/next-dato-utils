'use client'

import s from './DraftModeClient.module.scss'
import { usePathname } from 'next/navigation'
import { useEffect, useTransition } from 'react'

export type DraftModeProps = {
  enabled: boolean
  draftUrl?: string,
  tag?: string
  path?: string
  actions: {
    revalidateTag: (tag: string) => void
    revalidatePath: (path: string) => void
    disableDraftMode: (path: string) => void
  }
}

export default function DraftMode({ enabled, draftUrl, tag, path, actions }: DraftModeProps) {

  const pathname = usePathname()
  const [loading, startTransition] = useTransition();
  console.log('draft mode', enabled, draftUrl, tag, path)

  useEffect(() => {

    if (!draftUrl || !enabled) return

    let updates = 0;
    const eventSource = new EventSource(draftUrl)

    eventSource.addEventListener("open", () => {
      console.log("connected to channel!");
    });

    eventSource.addEventListener("update", async (event) => {
      if (++updates <= 1) return

      startTransition(() => {
        if (tag)
          actions.revalidateTag(tag)
        if (path)
          actions.revalidatePath(path)
      })
    });
    return () => {
      eventSource.close()
    }

  }, [draftUrl, tag, path, enabled])

  if (!enabled) return null

  return (
    <div className={s.draftMode} >
      <div className={s.label}><img width="20" height="20" /><div>Draft Mode</div></div>
      <button onClick={() => startTransition(() => {
        console.log('exit draft mode')
        actions.disableDraftMode(pathname)
      })}>
        Exit
        {loading && <div className={s.loading}><div className={s.loader}></div></div>}
      </button>
    </div>
  )
}