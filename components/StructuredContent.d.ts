export type Props = {
    content: any;
    className?: string;
    blocks?: any;
    styles?: {
        [key: string]: string;
    };
    options?: {
        unwrapParagraphs?: boolean;
    };
};
export default function StructuredContent({ content, className, blocks, styles, options }: Props): import("react/jsx-runtime").JSX.Element | null;
