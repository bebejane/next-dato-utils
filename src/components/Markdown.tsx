import React from "react";
import ReactMarkdown from "react-markdown";
import gfm from 'remark-gfm'
import Link from "next/link.js";
import markdownTruncate from '../utils/markdown-truncate'
import remarkBreaks from 'remark-breaks'
import type { UrlObject } from 'url';
import { Components } from "react-markdown";

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

const Markdown = ({ content, truncate, className, components, sentances = 1, allowedElements, scroll = true, disableBreaks = false }: MarkdownProps) => {

  const truncatedContent: string = (!truncate ? content ? truncateSentances(content as string, sentances) : content : markdownTruncate(content, { limit: truncate, ellipsis: true })) as string

  return (
    <ReactMarkdown
      remarkPlugins={disableBreaks ? [gfm] : [gfm, remarkBreaks]}
      className={className}
      children={truncatedContent}
      allowedElements={allowedElements}
      //@ts-ignore
      components={components ?? {
        a: ({ children, href }: AnchorProp) => <Link scroll={scroll} href={href}>{children[0]}</ Link>
      }}
    />
  )
}

export default Markdown

