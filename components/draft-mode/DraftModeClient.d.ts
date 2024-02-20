export type DraftModeProps = {
    enabled: boolean;
    draftUrl?: string | null | undefined;
    tag?: string | string[] | null | undefined;
    path?: string | string[] | null | undefined;
    actions: {
        revalidateTag: (tag: string | string[]) => void;
        revalidatePath: (path: string | string[]) => void;
        disableDraftMode: (path: string) => void;
    };
};
export default function DraftMode({ enabled, draftUrl, tag, path, actions }: DraftModeProps): import("react/jsx-runtime").JSX.Element | null;
