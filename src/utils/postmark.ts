import { z } from 'zod'
import * as postmark from 'postmark';

export type Props = {
  subject: string
  to?: string
  html?: string
  text?: string
  template?: string
  templateData?: any
}

export async function sendPostmarkEmail({ to, subject, html, text, template, templateData }: Props): Promise<{ success: boolean, error?: string }> {

  try {
    if (!process.env.POSTMARK_API_TOKEN)
      throw new Error('POSTMARK_API_TOKEN is not set')
    if (!process.env.POSTMARK_FROM_EMAIL)
      throw new Error('POSTMARK_FROM_EMAIL is not set')
    if (!process.env.POSTMARK_FROM_NAME)
      throw new Error('POSTMARK_FROM_NAME is not set')

    const isTemplateEmail = typeof template === 'string'

    try {
      if (!isTemplateEmail) {
        z.string().min(1).parse(subject)
        z.string().min(1).parse(text)
      }

    } catch (e) {
      throw new Error("Missing subject or text field")
    }

    try {
      if (to) {
        z.string().email().parse(to)
      }

    } catch (e) {
      throw new Error("Invalid To e-mail address")
    }

    const postmarkClient = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);

    const res = isTemplateEmail ?
      await postmarkClient.sendEmailWithTemplate({
        From: process.env.POSTMARK_FROM_EMAIL,
        To: to || process.env.POSTMARK_FROM_EMAIL,
        TemplateAlias: template,
        TemplateModel: templateData ?? {}
      }) : await postmarkClient.sendEmail({
        From: process.env.POSTMARK_FROM_EMAIL,
        To: to || process.env.POSTMARK_FROM_EMAIL,
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