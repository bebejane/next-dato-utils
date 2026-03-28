'use client';

import s from './DraftModeClient.module.css';
import { usePathname, useRouter } from 'next/navigation.js';
import { useEffect, useTransition, useRef, useState } from 'react';
import Modal from '../Modal.js';
import { DraftModeListener } from './DraftModeListener.js';

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

const refreshInterval = 1000 * 60 * 3;

export default function DraftModeClient({
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
	const [focused, setFocused] = useState<boolean | null>(null);
	const refreshRef = useRef<NodeJS.Timeout | null>(null);
	const insideiFrame = typeof window !== 'undefined' && window.location !== window.parent.location;
	const dev = process.env.NODE_ENV === 'development';
	const contentEditingUrl = process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL;
	const tags = tag ? (Array.isArray(tag) ? tag : [tag]) : [];
	const paths = path ? (Array.isArray(path) ? path : [path]) : [];
	const refreshing = useRef<boolean>(false);
	const listeners = useRef<{ [key: string]: DraftModeListener }>({});
	const urls: string[] = (_url ? (Array.isArray(_url) ? _url : [_url]) : []).filter(
		(u) => u,
	) as string[];

	useEffect(() => {
		setMounted(true);
		//console.log('DraftModeClient:', 'mount');
		if (!path) return;
		if (Array.isArray(path) ? path[0] !== pathname : path !== pathname)
			console.warn('DraftModeClient: path does not match current path', path, pathname);

		return () => {
			//console.log('DraftModeClient:', 'unmount');
		};
	}, [enabled]);

	useEffect(() => {
		if (!enabled) return;
		function handleVisibilityChange(e: any) {
			setFocused((f) => !document.hidden);
		}
		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [enabled]);

	useEffect(() => {
		if (!enabled) return;
		//console.log('DraftModeClient: urls change');
		urls?.forEach((u) => connect(u));
		return () => urls?.forEach((u) => disconnect(u));
	}, [enabled, JSON.stringify(urls)]);

	useEffect(() => {
		if (!enabled) return;
		if (focused === true) refresh();
		else if (focused === false) Object.keys(listeners.current).forEach((u) => disconnect(u));
	}, [enabled, focused]);

	function connect(url: string) {
		const listener = new DraftModeListener(url);
		listeners.current[url] = listener;

		listener.on('update', (url) => {
			//console.log('DraftModeClient: update', url);
			if (tags?.length === 0 && paths?.length === 0) return;

			//console.log('DraftModeClient: revalidate', 'paths', paths, 'tags', tags);

			startTransition(() => {
				if (tags?.length) actions.revalidateTag(tags);
				if (paths?.length) actions.revalidatePath(paths, 'page');
			});
		});
		listener.on('connect', (url) => {
			listeners.current[url] = listener;
			refreshRef.current && clearInterval(refreshRef.current);
			refreshRef.current = setInterval(() => {
				//console.log('DraftModeClient: refresh (interval)');
				refresh(0);
			}, refreshInterval);
		});
		listener.on('disconnect', (url) => {
			//console.log('DraftModeClient: disconnect', url);
			refreshRef.current && clearInterval(refreshRef.current);
		});
		listener.on('error', (url) => {
			//console.log('DraftModeClient:', 'error', url);
			refresh();
		});
		listener.connect();
	}

	function disconnect(url: string) {
		listeners.current?.[url]?.destroy();
		delete listeners.current?.[url];
	}

	async function refresh(delay = 1000) {
		if (refreshing.current) return;
		setReloading(true);
		refreshing.current = true;
		refreshRef.current && clearInterval(refreshRef.current);
		//console.log('DraftModeClient: refresh', delay);
		await new Promise((r) => setTimeout(r, delay));
		router.refresh();
		refreshing.current = false;
		setReloading(false);
	}

	if (!mounted) return null;

	return (
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
				{contentEditingUrl && !insideiFrame && (dev || enabled) && (
					<a
						className={s.link}
						href={`/api/draft?secret=${secret ?? ''}&slug=${path}${!enabled ? '' : '&exit=1'}`}
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
		</Modal>
	);
}
