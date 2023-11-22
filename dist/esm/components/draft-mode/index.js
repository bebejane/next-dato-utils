'use server';
import { jsx as _jsx } from "react/jsx-runtime";
import { draftMode } from 'next/headers.js';
import { revalidateTag, revalidatePath, disableDraftMode } from '../../server-actions/index.js';
import DraftModeClient from './DraftModeClient.js';
export default async function DraftMode({ url, tag, path }) {
    if (!url)
        return null;
    return (_jsx(DraftModeClient, { enabled: draftMode().isEnabled, draftUrl: url, tag: tag, path: path, actions: { revalidateTag, revalidatePath, disableDraftMode } }));
}
//# sourceMappingURL=index.js.map