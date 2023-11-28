/// <reference types="react" />
export type BlockProps = {
    data: any;
    onClick?: (ids: string) => void;
    components: {
        [key: string]: JSX.Element;
    };
};
export default function Block({ data, onClick, components }: BlockProps): import("react/jsx-runtime").JSX.Element;
