export type Props = {
    id: string;
    content: any;
    className?: string;
    onClick?: (imageId: string) => void;
    blocks?: any;
};
export default function StructuredText({ content, className, onClick, blocks }: Props): import("react/jsx-runtime").JSX.Element | null;
