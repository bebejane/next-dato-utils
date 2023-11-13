'use server';
import { jsx as _jsx } from "react/jsx-runtime";
import { revalidateTag, revalidatePath, disableDraftMode } from '../../actions';
import DraftModeClient from './DraftModeClient';
export default function DraftMode({ enabled, draftUrl, tag, path }) {
    return (_jsx(DraftModeClient, { enabled: enabled, draftUrl: draftUrl, tag: tag, path: path, actions: { revalidateTag, revalidatePath, disableDraftMode } }));
}
//# sourceMappingURL=index.js.map