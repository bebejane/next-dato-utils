'use client';

import s from './DraftModeClient.module.css';
import { usePathname, useRouter } from 'next/navigation.js';
import { ContentLink } from 'react-datocms';
import { useEffect, useTransition, useRef, useState } from 'react';
import Modal from '../Modal.js';
import { sleep } from '../../utils/index.js';

export type DraftModeProps = {
	enabled: boolean;
	url?: (string | null | undefined)[] | string | undefined | null;
	tag?: string | string[] | null | undefined;
	path?: string | string[] | null | undefined;
	actions: {
		revalidateTag: (tag: string | string[]) => void;
		revalidatePath: (path: string | string[]) => void;
		disableDraftMode: (path: string) => void;
	};
};

export default function DraftMode({ enabled, url: _url, tag, path, actions }: DraftModeProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [loading, startTransition] = useTransition();
	const [mounted, setMounted] = useState(false);
	const listeners = useRef<{ [key: string]: { listener: EventSource; interval: NodeJS.Timeout } }>(
		{},
	);
	const tags = tag ? (Array.isArray(tag) ? tag : [tag]) : [];
	const paths = path ? (Array.isArray(path) ? path : [path]) : [];
	const urls: string[] = (_url ? (Array.isArray(_url) ? _url : [_url]) : []).filter(
		(u) => u,
	) as string[];

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!urls.length || !enabled || Object.keys(listeners?.current).length > 0) return;

		console.log('DraftModeClient:', urls);
		const connect = (url: string): { listener: EventSource; interval: NodeJS.Timeout } => {
			console.log('DraftModeClient: connecting...');

			let updates = 0;
			const listener = new EventSource(url);

			listener.addEventListener('open', () => {
				console.log('DraftModeClient: connected to channel');
			});

			listener.addEventListener('update', async (event) => {
				console.log('update', event);
				if (++updates <= 1) return;

				console.log('DraftModeClient: update');
				console.log(event);
				try {
					console.log(JSON.parse(event.data));
				} catch (e) {}

				console.log('revalidate', 'tags', tags);
				console.log('revalidate', 'paths', paths);

				startTransition(() => {
					if (tags) actions.revalidateTag(tags);
					if (paths) actions.revalidatePath(paths);
				});
			});

			listener.addEventListener('channelError', (err) => {
				console.log('DraftModeClient: channel error');
				console.log(err);
			});

			const interval = setInterval(async () => {
				console.log('DraftModeClient: statusCheck', listener.readyState);
				if (listener.readyState === 2) {
					console.log('DraftModeClient: channel closed');
					await disconnect(url);
					connect(url);
				}
			}, 1000);

			listeners.current[url] = { listener, interval };
			return { listener, interval };
		};

		const disconnect = async (url: string) => {
			if (listeners.current[url]) {
				listeners.current[url].listener.close();
				clearInterval(listeners.current[url].interval);
				delete listeners.current[url];
				console.log('DraftModeClient: diconnected listener');
			}

			console.log('DraftModeClient: diconnected');
			await sleep(300);
		};

		urls.forEach((u) => connect(u));

		return () => {
			urls.forEach((u) => disconnect(u));
		};
	}, [urls, tag, path, enabled]);

	if (!enabled || !mounted) return null;

	return (
		<>
			<Modal>
				<div className={s.draftMode}>{loading ? <div className={s.loader} /> : <span></span>}</div>
				<ContentLink
					currentPath={pathname}
					onNavigateTo={() => router.push(pathname)}
					enableClickToEdit={{ hoverOnly: true }}
				/>
			</Modal>
		</>
	);
}
