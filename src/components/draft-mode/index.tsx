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

	const enabled = (await draftMode()).isEnabled;
	const secret =
		process.env.NODE_ENV === 'development' ? process.env.DATOCMS_PREVIEW_SECRET : undefined;

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
