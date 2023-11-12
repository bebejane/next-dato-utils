'use client'

import { revalidateTag, revalidatePath, disableDraftMode } from '../actions'
import s from './DraftMode.module.scss'
import { usePathname } from 'next/navigation'
import { startTransition, useEffect, useState } from 'react'

export type DraftModeProps = {
  enabled: boolean
  draftUrl?: string,
  tag?: string
  path?: string
}

export default function DraftMode({ enabled, draftUrl, tag, path }: DraftModeProps) {

  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {

    if (!draftUrl || !enabled) return

    let updates = 0;
    const eventSource = new EventSource(draftUrl)

    eventSource.addEventListener("open", () => {
      console.log("connected to channel!");
    });

    eventSource.addEventListener("update", async (event) => {
      if (++updates <= 1) return

      setLoading(true)

      if (tag)
        await revalidateTag(tag)
      if (path)
        await revalidatePath(path)

      setLoading(false)

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
        setLoading(true)
        //disableDraftMode(pathname)
        revalidateTag(tag as string)
        setLoading(false)
      })}>
        Exit
        {loading && <div className={s.loading}><div className={s.loader}></div></div>}
      </button>
    </div>
  )
}