import { jsx as _jsx } from "react/jsx-runtime";
import ReactMarkdown from "react-markdown";
import gfm from 'remark-gfm';
import Link from "next/link.js";
import markdownTruncate from '../utils/markdown-truncate';
import remarkBreaks from 'remark-breaks';
const truncateSentances = (markdown, limit) => {
    if (!markdown)
        return markdown;
    const sentances = markdown.split('.');
    return sentances.length >= limit ? sentances.slice(0, limit).join(' ') + '...' : markdown;
};
export default async function Markdown({ content, truncate, className, components, sentances = 1, allowedElements, scroll = true, disableBreaks = false }) {
    const truncatedContent = (!truncate ? content ? truncateSentances(content, sentances) : content : markdownTruncate(content, { limit: truncate, ellipsis: true }));
    return (_jsx(ReactMarkdown, { remarkPlugins: disableBreaks ? [gfm] : [gfm, remarkBreaks], className: className, children: truncatedContent, allowedElements: allowedElements, 
        //@ts-ignore
        components: components ?? {
            a: ({ children, href }) => _jsx(Link, { scroll: scroll, href: href, children: children[0] })
        } }));
}
//# sourceMappingURL=Markdown.js.map