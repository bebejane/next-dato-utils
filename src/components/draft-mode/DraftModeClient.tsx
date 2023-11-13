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

  useEffect(() => {

    if (!draftUrl || !enabled) return

    let updates = 0;
    const eventSource = new EventSource(draftUrl)

    eventSource.addEventListener("open", () => {
      console.log("connected to channel!");
    });

    eventSource.addEventListener("update", async (event) => {
      if (++updates <= 1) return
      console.log(event)

      startTransition(() => {
        if (tag)
          actions.revalidateTag(tag)
        if (path)
          actions.revalidatePath(path)
      })

    });
    eventSource.addEventListener("error", (err) => {
      console.log('channel error')
      console.log(err)
    })
    return () => {
      eventSource.close()
    }

  }, [draftUrl, tag, path, enabled])

  if (!enabled) return null

  return (
    <div className={s.draftMode} >
      <div className={s.label}><img width="20" height="20" /><div>Draft Mode</div></div>
      <div className={s.button}>
        <button onClick={() => startTransition(() => actions.disableDraftMode(pathname))}>
          Exit
          {loading && <div className={s.loading}><div className={s.loader}></div></div>}
        </button>
      </div>
    </div>
  )
}