/// <reference types="react" />
export type BlockProps = {
    data: any;
    className?: string;
    onClick?: (ids: string) => void;
    components: any;
};
export default function Block({ data, onClick, components, className }: BlockProps): import("react").JSX.Element;
