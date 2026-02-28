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
		revalidatePath: (path: string | string[], type: 'page' | 'layout') => void;
		disableDraftMode: (path: string) => void;
	};
	position: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
	secret?: string;
};

export default function DraftMode({
	enabled,
	url: _url,
	tag,
	path,
	actions,
	position,
	secret,
}: DraftModeProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [loading, startTransition] = useTransition();
	const [mounted, setMounted] = useState(false);
	const isDev = process.env.NODE_ENV === 'development';
	const tags = tag ? (Array.isArray(tag) ? tag : [tag]) : [];
	const paths = path ? (Array.isArray(path) ? path : [path]) : [];
	const listeners = useRef<{ [key: string]: { listener: EventSource; interval: NodeJS.Timeout } }>(
		{},
	);
	const urls: string[] = (_url ? (Array.isArray(_url) ? _url : [_url]) : []).filter(
		(u) => u,
	) as string[];

	function disconnect(url: string) {
		if (!listeners.current[url]) return;

		clearInterval(listeners.current[url].interval);
		listeners.current[url].listener.close();
		delete listeners.current[url];
		console.log('DraftModeClient: diconnected');
	}

	async function reconnect(url: string) {
		console.log('DraftModeClient: reconnect');
		disconnect(url);
		await sleep(2000);
		connect(url);
	}

	async function connect(url: string) {
		console.log('DraftModeClient: connecting...');

		disconnect(url);

		let updates = 0;
		const listener = new EventSource(url);

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

			if (tags?.length === 0 && paths?.length === 0) return;

			disconnect(url);

			console.log('DraftModeClient: revalidate', 'paths', paths, 'tags', tags);

			startTransition(() => {
				if (tags?.length) actions.revalidateTag(tags);
				if (paths?.length) actions.revalidatePath(paths, 'page');
			});
		});

		listener.addEventListener('channelError', (err) => {
			console.log('DraftModeClient: channel error');
			console.log(err);
		});

		listener.addEventListener('open', () => {
			console.log('DraftModeClient: connected to channel');
			listeners.current[url] = {
				listener,
				interval: setInterval(async () => listener.readyState === 2 && reconnect(url), 2000),
			};
		});
	}

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!urls?.length || !enabled) return;

		console.log('DraftModeClient (start):', urls);
		urls.forEach((u) => connect(u));

		return () => {
			urls.forEach((u) => disconnect(u));
		};
	}, [urls, tag, path, enabled]);

	if (!mounted) return null;

	return (
		<>
			<Modal>
				<div
					className={s.draft}
					style={{
						top: position === 'topleft' || position === 'topright' ? '0px' : 'auto',
						bottom: position === 'bottomleft' || position === 'bottomright' ? '0px' : 'auto',
						left: position === 'topleft' || position === 'bottomleft' ? '0px' : 'auto',
						right: position === 'bottomright' || position === 'topright' ? '0px' : 'auto',
					}}
				>
					{isDev && (
						<a
							href={`/api/draft?secret=${secret}&slug=${path}${!enabled ? '' : '&exit=1'}`}
							className={s.link}
						>
							<button className={s.button}>{enabled ? 'Exit' : 'Draft'}</button>
						</a>
					)}
					{loading && <div className={s.loader} />}
				</div>
				{enabled && (
					<ContentLink
						currentPath={pathname}
						onNavigateTo={() => {
							console.log('DraftModeClient:', pathname);
							router.push(pathname);
						}}
						enableClickToEdit={{ hoverOnly: true }}
					/>
				)}
			</Modal>
		</>
	);
}
