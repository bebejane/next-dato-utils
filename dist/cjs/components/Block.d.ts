export type BlockProps = {
    data: any;
    onClick?: (ids: string) => void;
    components: any;
};
export default function Block({ data, onClick, components }: BlockProps): import("react/jsx-runtime").JSX.Element;
