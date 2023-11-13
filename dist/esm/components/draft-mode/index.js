'use server';
import { jsx as _jsx } from "react/jsx-runtime";
import { draftMode } from 'next/headers';
import { revalidateTag, revalidatePath, disableDraftMode } from '../../actions';
import DraftModeClient from './DraftModeClient';
export default async function DraftMode({ url, tag, path }) {
    return (_jsx(DraftModeClient, { enabled: draftMode().isEnabled, draftUrl: url, tag: tag, path: path, actions: { revalidateTag, revalidatePath, disableDraftMode } }));
}
//# sourceMappingURL=index.js.map