'use server';

import { draftMode } from 'next/headers.js';
import { revalidateTag, revalidatePath, disableDraftMode } from '../../server-actions/index.js';
import DraftModeClient from './DraftModeClient.js';

export type Props = {
	url?: (string | null | undefined)[] | string | undefined | null;
	tag?: string | string[] | undefined | null;
	path?: string | string[] | undefined | null;
	position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
};

export default async function DraftMode({ url, tag, path, position = 'bottomright' }: Props) {
	if (!tag && !path) throw new Error('DraftMode: tag or path is required');

	const isDevPreview =
		process.env.NODE_ENV === 'development' &&
		process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL !== undefined &&
		process.env.NEXT_PUBLIC_DATOCMS_VISUAL_EDITING_PREVIEW !== undefined;

	const enabled = (await draftMode()).isEnabled;
	const secret = isDevPreview ? process.env.DATOCMS_PREVIEW_SECRET : undefined;

	if (!process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL) return null;
	if (isDevPreview && !enabled) return null;

	return (
		<DraftModeClient
			enabled={enabled}
			url={url}
			tag={tag}
			path={path}
			position={position}
			secret={secret}
			actions={{ revalidateTag, revalidatePath, disableDraftMode }}
		/>
	);
}
