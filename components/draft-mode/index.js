'use server';
import { jsx as _jsx } from "react/jsx-runtime";
import { draftMode } from 'next/headers.js';
import { revalidateTag, revalidatePath, disableDraftMode } from '../../server-actions/index.js';
import DraftModeClient from './DraftModeClient.js';
export default async function DraftMode({ url, tag, path, position = 'bottomright' }) {
    if (!url || (!tag && !path))
        return null;
    const enabled = (await draftMode()).isEnabled;
    const secret = process.env.NODE_ENV === 'development' ? process.env.DATOCMS_PREVIEW_SECRET : undefined;
    return (_jsx(DraftModeClient, { enabled: enabled, url: url, tag: tag, path: path, position: position, secret: secret, actions: { revalidateTag, revalidatePath, disableDraftMode } }));
}
//# sourceMappingURL=index.js.map