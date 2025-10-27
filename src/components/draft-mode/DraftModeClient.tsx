'use client';

import s from './DraftModeClient.module.scss';
import { usePathname } from 'next/navigation.js';
import { useEffect, useTransition, useRef } from 'react';
import { sleep } from '../../utils/index.js';

export type DraftModeProps = {
	enabled: boolean;
	draftUrl?: string | null | undefined;
	tag?: string | string[] | null | undefined;
	path?: string | string[] | null | undefined;
	actions: {
		revalidateTag: (tag: string | string[]) => void;
		revalidatePath: (path: string | string[]) => void;
		disableDraftMode: (path: string) => void;
	};
};

export default function DraftMode({ enabled, draftUrl, tag, path, actions }: DraftModeProps) {
	const pathname = usePathname();
	const [loading, startTransition] = useTransition();
	const listener = useRef<EventSource | null>(null);
	const tags = tag ? (Array.isArray(tag) ? tag : [tag]) : [];
	const paths = path ? (Array.isArray(path) ? path : [path]) : [];

	useEffect(() => {
		if (!draftUrl || !enabled || listener?.current) return;

		const connect = () => {
			console.log('connecting to channel');
			let updates = 0;
			listener.current = new EventSource(draftUrl);

			listener.current.addEventListener('open', () => {
				console.log('connected to channel!');
			});

			listener.current.addEventListener('update', async (event) => {
				if (++updates <= 1) return;
				console.log(event);

				startTransition(() => {
					if (tags) actions.revalidateTag(tags);
					if (paths) actions.revalidatePath(paths);
				});
			});

			listener.current.addEventListener('channelError', (err) => {
				console.log('channel error');
				console.log(err);
			});

			const statusCheck = setInterval(async () => {
				if (listener.current?.readyState === 2) {
					console.log('channel closed');
					clearInterval(statusCheck);
					await disconnect();
					connect();
				}
			}, 1000);
		};

		const disconnect = async () => {
			if (listener.current) {
				listener.current.close();
				listener.current = null;
			}
			await sleep(1000);
		};

		connect();

		return () => {
			disconnect();
		};
	}, [draftUrl, tag, path, enabled]);

	if (!enabled) return null;

	return (
		<div className={s.draftMode}>
			<div className={s.label}>
				<img className={loading ? s.loading : undefined} width='20' height='20' />
				<div>Draft mode</div>
			</div>
			<div className={s.button}>
				<button onClick={() => startTransition(() => actions.disableDraftMode(pathname))}>Exit</button>
			</div>
		</div>
	);
}
