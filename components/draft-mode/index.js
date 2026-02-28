'use server';
import { jsx as _jsx } from "react/jsx-runtime";
import { draftMode } from 'next/headers.js';
import { revalidateTag, revalidatePath, disableDraftMode } from '../../server-actions/index.js';
import DraftModeClient from './DraftModeClient.js';
export default async function DraftMode({ url, tag, path, position = 'bottomright' }) {
    if (!url || (!tag && !path))
        return null;
    const enabled = (await draftMode()).isEnabled;
    return (_jsx(DraftModeClient, { enabled: enabled, url: url, tag: tag, path: path, position: position, actions: { revalidateTag, revalidatePath, disableDraftMode } }));
}
//# sourceMappingURL=index.js.map