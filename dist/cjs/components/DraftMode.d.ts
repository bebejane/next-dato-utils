import { DraftMode as DraftModeType } from 'next/dist/client/components/draft-mode';
export type DraftModeProps = {
    enabled: boolean;
    draftUrl?: string;
    draftMode?: DraftModeType;
    tag?: string;
    path?: string;
};
export default function DraftMode({ enabled, draftUrl, tag, path }: DraftModeProps): import("react/jsx-runtime").JSX.Element | null;
