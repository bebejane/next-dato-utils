/// <reference types="react" />
export type Props = {
    url?: string | undefined | null;
    tag?: string | string[] | undefined | null;
    path?: string | string[] | undefined | null;
};
export default function DraftMode({ url, tag, path }: Props): Promise<import("react").JSX.Element>;
