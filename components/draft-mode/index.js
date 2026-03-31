'use server';
import { jsx as _jsx } from "react/jsx-runtime";
import { draftMode } from 'next/headers.js';
import { revalidateTag, revalidatePath, disableDraftMode } from '../../server-actions/index.js';
import DraftModeClient from './DraftModeClient.js';
export default async function DraftMode({ url, tag, path, position = 'bottomright' }) {
    if (!tag && !path)
        throw new Error('DraftMode: tag or path is required');
    const isDevPreview = process.env.NODE_ENV === 'development' &&
        process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL !== undefined &&
        process.env.NEXT_PUBLIC_DATOCMS_VISUAL_EDITING_PREVIEW !== undefined;
    const enabled = (await draftMode()).isEnabled;
    const secret = isDevPreview ? process.env.DATOCMS_PREVIEW_SECRET : undefined;
    if (!process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL)
        return null;
    return (_jsx(DraftModeClient, { enabled: enabled, url: url, tag: tag, path: path, position: position, secret: secret, actions: { revalidateTag, revalidatePath, disableDraftMode } }));
}
//# sourceMappingURL=index.js.map