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

	function disconnect(url: string) {
		if (!listeners.current[url]) return;

		listeners.current[url].listener.close();
		clearInterval(listeners.current[url].interval);
		delete listeners.current[url];
		console.log('DraftModeClient: diconnected');
	}

	async function reconnect(url: string) {
		console.log('DraftModeClient: reconnect');
		disconnect(url);
		await sleep(2000);
		connect(url);
	}

	function connect(url: string) {
		console.log('DraftModeClient: connecting...');

		disconnect(url);

		let updates = 0;
		const listener = new EventSource(url, {
			withCredentials: true,
		});

		listener.addEventListener('disconnect', async (event) => {
			console.log('DraftModeClient: for real disconnect');
		});

		listener.addEventListener('close', async (event) => {
			console.log('DraftModeClient: for real close');
		});

		listener.addEventListener('error', async (err) => {
			console.log('DraftModeClient: error', err);
		});

		listener.addEventListener('update', async (event) => {
			console.log('update', event);
			if (++updates <= 1) return;

			console.log('DraftModeClient: update', event);

			try {
				console.log(JSON.parse(event.data));
			} catch (e) {}

			console.log('DraftModeClient: revalidate', 'tags', tags);
			console.log('DraftModeClient:revalidate', 'paths', paths);

			startTransition(() => {
				if (tags) actions.revalidateTag(tags);
				if (paths) actions.revalidatePath(paths);
			});
		});

		listener.addEventListener('channelError', (err) => {
			console.log('DraftModeClient: channel error');
			console.log(err);
		});

		listener.addEventListener('open', () => {
			console.log('DraftModeClient: connected to channel');
			const interval = setInterval(async () => {
				if (listener.readyState === 2) reconnect(url);
			}, 1000);
			listeners.current[url] = { listener, interval };
		});
	}

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!urls.length || !enabled) return;

		console.log('DraftModeClient (start):', urls);
		urls.forEach((u) => connect(u));

		return () => {
			urls.forEach((u) => disconnect(u));
		};
	}, [urls, tag, path, enabled]);

	if (!enabled || !mounted) return null;

	return (
		<>
			<Modal>
				{loading && <div className={s.loader} />}
				<ContentLink
					currentPath={pathname}
					onNavigateTo={() => router.push(pathname)}
					enableClickToEdit={{ hoverOnly: true }}
				/>
			</Modal>
		</>
	);
}
