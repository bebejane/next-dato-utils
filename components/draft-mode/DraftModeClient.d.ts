export type DraftModeProps = {
    enabled: boolean;
    url?: (string | null | undefined)[] | string | undefined | null;
    tag?: string | string[] | null | undefined;
    path?: string | string[] | null | undefined;
    position: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
    secret?: string;
    actions: {
        revalidateTag: (tag: string | string[]) => void;
        revalidatePath: (path: string | string[], type: 'page' | 'layout') => void;
        disableDraftMode: (path: string) => void;
    };
};
export default function DraftModeClient({ enabled, url: _url, tag, path, actions, position, secret, }: DraftModeProps): import("react/jsx-runtime").JSX.Element | null;
