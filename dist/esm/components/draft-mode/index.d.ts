export type Props = {
    url?: string | undefined | null;
    tag?: string;
    path?: string;
};
export default function DraftMode({ url, tag, path }: Props): Promise<import("react/jsx-runtime").JSX.Element | null>;
