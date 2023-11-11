/// <reference types="node" />
import type { UrlObject } from 'url';
import { Components } from "react-markdown";
export type MarkdownProps = {
    content?: string;
    allowedElements?: string[];
    truncate?: number;
    className?: string;
    sentances?: number;
    components?: Partial<Omit<any, keyof Components> & Components>;
    scroll?: boolean;
    disableBreaks?: boolean;
};
export type AnchorProp = {
    children: any[];
    href: UrlObject;
};
declare const Markdown: ({ content, truncate, className, components, sentances, allowedElements, scroll, disableBreaks }: MarkdownProps) => import("react/jsx-runtime").JSX.Element;
export default Markdown;
