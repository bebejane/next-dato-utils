'use server'

import { ZodError, z } from 'zod'
import { sendPostmarkEmail } from '../utils/postmark.js'

export default async function sendPostmarkEmailServerAction(prevState: any, formData: FormData): Promise<{ success: boolean, error?: string }> {

  try {

    const subject = formData.get('subject') as string
    const html = formData.get('html') as string
    const text = formData.get('text') as string
    const template = formData.get('template') as string
    const templateData: { [k: string]: string } = {}

    await sendPostmarkEmail({ subject, html, text, template, templateData })

    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: error instanceof Error ? error.message : error as string }
  }
}