export type Props = {
    url?: (string | null | undefined)[] | string | undefined | null;
    tag?: string | string[] | undefined | null;
    path?: string | string[] | undefined | null;
    position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
};
export default function DraftMode({ url, tag, path, position }: Props): Promise<import("react/jsx-runtime").JSX.Element | null>;
