'use server'

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidateTag as rt, revalidatePath as rp } from 'next/cache'

export async function disableDraftMode(pathname?: string) {
  console.log('disableDraftMode', pathname)
  draftMode().disable()
  redirect(pathname ?? `/`)
}

export async function revalidateTag(tag: string) {
  return rt(tag)
}

export async function revalidatePath(path: string) {
  return rp(path)
}