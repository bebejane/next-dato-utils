export type DraftModeProps = {
    enabled: boolean;
    draftUrl?: string;
    tag?: string;
    path?: string;
    actions: {
        revalidateTag: (tag: string) => void;
        revalidatePath: (path: string) => void;
        disableDraftMode: (path: string) => void;
    };
};
export default function DraftMode({ enabled, draftUrl, tag, path, actions }: DraftModeProps): import("react/jsx-runtime").JSX.Element | null;
