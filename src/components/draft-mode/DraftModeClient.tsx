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
	position: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
	secret?: string;
	actions: {
		revalidateTag: (tag: string | string[]) => void;
		revalidatePath: (path: string | string[], type: 'page' | 'layout') => void;
		disableDraftMode: (path: string) => void;
	};
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
	const [reloading, setReloading] = useState(false);
	const [mounted, setMounted] = useState(false);
	const dev = process.env.NODE_ENV === 'development';
	const contentEditingUrl = process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL;
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
			if (++updates <= 1) {
				return;
			}

			console.log('DraftModeClient: update', event);
			if (tags?.length === 0 && paths?.length === 0) return;

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
			disconnect(url);
			listeners.current[url] = {
				listener,
				interval: setInterval(async () => {
					listener.readyState === 1 && listener.dispatchEvent(new Event('ping'));
					listener.readyState === 2 && reconnect(url);
				}, 2000),
			};
		});
	}

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!urls?.length || !enabled || loading) return;

		console.log('DraftModeClient (start):', urls);
		urls.forEach((u) => connect(u));

		return () => {
			console.log('unmount');
			urls.forEach((u) => disconnect(u));
		};
	}, [loading, urls, tag, path, enabled]);

	if (!mounted) return null;

	const style = {
		top: position === 'topleft' || position === 'topright' ? '0px' : 'auto',
		bottom: position === 'bottomleft' || position === 'bottomright' ? '0px' : 'auto',
		left: position === 'topleft' || position === 'bottomleft' ? '0px' : 'auto',
		right: position === 'bottomright' || position === 'topright' ? '0px' : 'auto',
	};
	console.log({ contentEditingUrl, dev, enabled });
	return (
		<>
			<Modal>
				<div className={s.draft} style={style}>
					{contentEditingUrl && dev && (
						<a
							href={`/api/draft?secret=${secret ?? ''}&slug=${path}${!enabled ? '' : '&exit=1'}`}
							className={s.link}
							onClick={() => setReloading(true)}
						>
							<button aria-checked={enabled} className={s.button}>
								{reloading || loading ? (
									<div className={s.reloading} data-draft={enabled} />
								) : (
									'Draft'
								)}
							</button>
						</a>
					)}
					{loading && !dev && <div className={s.loading} data-draft={enabled} />}
				</div>
				{enabled && (
					<ContentLink
						currentPath={pathname}
						enableClickToEdit={{ hoverOnly: true }}
						onNavigateTo={() => {
							console.log('DraftModeClient:', pathname);
							router.push(pathname);
						}}
					/>
				)}
			</Modal>
		</>
	);
}
