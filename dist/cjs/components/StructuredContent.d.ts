export type Props = {
    content: any;
    className?: string;
    onClick?: (imageId: string) => void;
    blocks?: any;
    styleClasses?: {
        [key: string]: string;
    };
};
export default function StructuredContent({ content, className, onClick, blocks, styleClasses }: Props): import("react/jsx-runtime").JSX.Element | null;
