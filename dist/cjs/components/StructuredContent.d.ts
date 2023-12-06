export type Props = {
    content: any;
    className?: string;
    onClick?: (imageId: string) => void;
    blocks?: any;
    styles?: {
        [key: string]: string;
    };
};
export default function StructuredContent({ content, className, blocks, styles, onClick }: Props): import("react/jsx-runtime").JSX.Element | null;
