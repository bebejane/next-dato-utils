'use server'

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function disableDraftMode(pathname?: string) {
  console.log('disableDraftMode', pathname)
  draftMode().disable()
  redirect(pathname ?? `/`)
}