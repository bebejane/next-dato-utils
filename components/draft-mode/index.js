'use server';
import { jsx as _jsx } from "react/jsx-runtime";
import { draftMode } from 'next/headers.js';
import { revalidateTag, revalidatePath, disableDraftMode } from '../../server-actions/index.js';
import DraftModeClient from './DraftModeClient.js';
export default async function DraftMode({ url, tag, path, position = 'bottomright' }) {
    if (!tag && !path)
        throw new Error('DraftMode: tag or path is required');
    const isDev = process.env.NODE_ENV === 'development';
    const enabled = (await draftMode()).isEnabled;
    const secret = isDev ? process.env.DATOCMS_PREVIEW_SECRET : undefined;
    if (!process.env.DATOCMS_VISUAL_EDITING_PREVIEW)
        return null;
    return (_jsx(DraftModeClient, { enabled: enabled, url: url, tag: tag, path: path, position: position, secret: secret, actions: { revalidateTag, revalidatePath, disableDraftMode } }));
}
//# sourceMappingURL=index.js.map