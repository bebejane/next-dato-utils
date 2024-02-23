import { default as ReactMarkdown, Components } from 'react-markdown';
import gfm from 'remark-gfm'
import Link from 'next/link.js';
import markdownTruncate from '../utils/markdown-truncate.js'
import remarkBreaks from 'remark-breaks'
import type { UrlObject } from 'url';

export type MarkdownProps = {
  content?: string
  allowedElements?: string[]
  truncate?: number
  className?: string
  sentances?: number
  components?: Partial<Omit<any, keyof Components> & Components>
  scroll?: boolean,
  disableBreaks?: boolean
}

export type AnchorProp = {
  children: any[],
  href: UrlObject
}

const truncateSentances = (markdown: string, limit: number): string => {
  if (!markdown) return markdown
  const sentances = markdown.split('.')
  return sentances.length >= limit ? sentances.slice(0, limit).join(' ') + '...' : markdown
}

export default function Markdown({ content, truncate, className, components, sentances = 1, allowedElements, scroll = true, disableBreaks = false }: MarkdownProps) {

  const truncatedContent: string = (!truncate ? content && truncate ? truncateSentances(content as string, sentances) : content : markdownTruncate(content, { limit: truncate, ellipsis: true })) as string

  return (
    <ReactMarkdown
      remarkPlugins={disableBreaks ? [gfm] : [gfm, remarkBreaks]}
      className={className}
      children={truncatedContent}
      allowedElements={allowedElements}
      //@ts-ignore
      components={components ?? {
        //@ts-ignore
        a: ({ children, href }: AnchorProp) => <Link scroll={scroll} href={href}>{children[0]}</ Link>
      }}
    />
  )
}
