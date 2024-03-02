'use server'

import { ZodError, z } from 'zod'
import * as postmark from 'postmark';

export default async function sendPostmarkEmail(prevState: any, formData: FormData): Promise<{ success: boolean, error?: string }> {

  try {
    if (!process.env.POSTMARK_API_TOKEN)
      throw new Error('POSTMARK_API_TOKEN is not set')
    if (!process.env.POSTMARK_FROM_EMAIL)
      throw new Error('POSTMARK_FROM_EMAIL is not set')
    if (!process.env.POSTMARK_FROM_NAME)
      throw new Error('POSTMARK_FROM_NAME is not set')

    const subject = formData.get('subject') as string
    const html = formData.get('html') as string
    const text = formData.get('text') as string
    const template = formData.get('template') as string
    const isTemplateEmail = typeof template === 'string'
    const templateData: { [k: string]: string } = {}

    if (isTemplateEmail) {
      for (const [key, value] of formData.entries())
        key !== 'template' && (templateData[key] = value as string)
    }

    try {
      if (!isTemplateEmail) {
        z.string().min(1).parse(subject)
        z.string().min(1).parse(text)
      }

    } catch (e) {
      throw new Error("Invalid e-mail address")
    }

    const postmarkClient = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);
    const res = isTemplateEmail ?
      await postmarkClient.sendEmailWithTemplate({
        From: process.env.POSTMARK_FROM_EMAIL,
        To: process.env.POSTMARK_FROM_EMAIL,
        TemplateAlias: template,
        TemplateModel: templateData ?? {}
      }) : await postmarkClient.sendEmail({
        From: process.env.POSTMARK_FROM_EMAIL,
        To: process.env.POSTMARK_FROM_EMAIL,
        Subject: subject,
        HtmlBody: html,
        TextBody: text
      });

    if (res.ErrorCode) {
      throw new Error(`There was an error sending the email. (${res.ErrorCode}) ${res.Message}`)
    }

    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: error instanceof Error ? error.message : error as string }
  }
}