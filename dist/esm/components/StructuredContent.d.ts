export type Props = {
    content: any;
    className?: string;
    onClick?: (imageId: string) => void;
    blocks?: any;
};
export default function StructuredContent({ content, className, onClick, blocks }: Props): import("react/jsx-runtime").JSX.Element | null;
