"use server"
import { disableDraftMode } from '../actions'

export default async function DraftModeServer({ path }: { path: string }) {
  const disableDraftModeWithPathname = disableDraftMode.bind(null, path)

  return (
    <form action={disableDraftModeWithPathname}>
      <input type="hidden" name="path" value={path} />
      <button type="submit">Disable Draft Mode</button>
    </form>
  )
}