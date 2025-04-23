'use server';

import { draftMode } from 'next/headers';
import { revalidateTag, revalidatePath, disableDraftMode } from '../../server-actions';
import DraftModeClient from './DraftModeClient';

export type Props = {
	url?: string | undefined | null;
	tag?: string | string[] | undefined | null;
	path?: string | string[] | undefined | null;
};

export default async function DraftMode({ url, tag, path }: Props) {
	if (!url || (!tag && !path)) return null;

	const enabled = (await draftMode()).isEnabled;

	return (
		<DraftModeClient
			enabled={enabled}
			draftUrl={url}
			tag={tag}
			path={path}
			actions={{ revalidateTag, revalidatePath, disableDraftMode }}
		/>
	);
}
