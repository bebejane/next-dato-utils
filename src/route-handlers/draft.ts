'use server'

import { draftMode } from 'next/headers.js'
import { redirect } from 'next/navigation.js'
import { cookies } from 'next/headers.js'
import { disableDraftMode } from '../server-actions/index.js'

export default async function draft(request: Request): Promise<Response | void> {

  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')
  const maxAge = searchParams.get('max-age')
  const exit = searchParams.get('exit')

  if (secret !== process.env.DATOCMS_PREVIEW_SECRET)
    return new Response('Invalid token', { status: 401 })

  if (exit !== null) {
    console.log('Disabling draft mode')
    draftMode().disable()
  } else {
    console.log('Enabling draft mode')
    draftMode().enable()
  }

  if (maxAge) {
    const bypassCookie = cookies().get('__prerender_bypass');
    if (!bypassCookie)
      throw new Error('No bypass cookie found')

    cookies().set(bypassCookie.name, bypassCookie.value, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      path: '/',
      maxAge: parseInt(maxAge)
    })
  }

  if (slug)
    redirect(slug)
  else
    return new Response('OK', { status: 200 })
}