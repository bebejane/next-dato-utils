export type Props = {
    content: any;
    className?: string;
    blocks?: any;
    styles?: {
        [key: string]: string;
    };
};
export default function StructuredContent({ content, className, blocks, styles }: Props): import("react/jsx-runtime").JSX.Element | null;
