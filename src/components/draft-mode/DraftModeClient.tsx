'use client';

import s from './DraftModeClient.module.css';
import { usePathname, useRouter } from 'next/navigation.js';
import { ContentLink } from 'react-datocms';
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
	const insideiFrame = typeof window !== 'undefined' && window.location !== window.parent.location;
	const dev = process.env.NODE_ENV === 'development';
	const contentEditingUrl = process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL;
	const tags = tag ? (Array.isArray(tag) ? tag : [tag]) : [];
	const paths = path ? (Array.isArray(path) ? path : [path]) : [];
	const refreshRef = useRef<NodeJS.Timeout | null>(null);
	const listeners = useRef<{ [key: string]: DraftModeListener }>({});
	const urls: string[] = (_url ? (Array.isArray(_url) ? _url : [_url]) : []).filter(
		(u) => u,
	) as string[];

	useEffect(() => {
		setMounted(true);

		if (!path) return;
		if (Array.isArray(path) ? path[0] !== pathname : path !== pathname)
			console.warn('DraftModeClient: path does not match current path', path, pathname);
	}, []);

	useEffect(() => {
		if (!enabled) return;
		function handleVisibilityChange(e: any) {
			setFocused((f) => {
				if (f !== true) refresh(1000);
				return e.type === 'focus';
			});
		}

		window.addEventListener('focus', handleVisibilityChange);
		window.addEventListener('blur', handleVisibilityChange);

		return () => {
			window.removeEventListener('focus', handleVisibilityChange);
			window.removeEventListener('blur', handleVisibilityChange);
		};
	}, [enabled]);

	useEffect(() => {
		if (!enabled) return;
		console.log('check', focused);
		const interval = refreshRef.current;
		if (interval) {
			clearInterval(interval);
			console.log('clear interval');
		}

		if (focused || focused === null) {
			refreshRef.current = setInterval(() => refresh(), refreshInterval);
			console.log('start interval');
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [enabled, focused]);

	useEffect(() => {
		if (!urls?.length || !enabled || loading) return;
		urls.forEach((u) => connect(u));
		return () => urls.forEach((u) => disconnect(u));
	}, [loading, urls, enabled]);

	function connect(url: string) {
		const listener = new DraftModeListener(url);
		listeners.current[url] = listener;

		listener.on('update', (url) => {
			console.log('DraftModeClient: update', url);
			if (tags?.length === 0 && paths?.length === 0) return;

			console.log('DraftModeClient: revalidate', 'paths', paths, 'tags', tags);

			startTransition(() => {
				if (tags?.length) actions.revalidateTag(tags);
				if (paths?.length) actions.revalidatePath(paths, 'page');
			});
		});
		listener.on('connect', (url) => {
			listeners.current[url] = listener;
		});
		listener.on('disconnect', (url) => {
			delete listeners.current[url];
			refresh();
		});
		listener.on('error', (url) => {
			console.log('DraftModeClient:', 'error', url);
			refresh();
		});
	}

	function disconnect(url: string) {
		listeners.current?.[url]?.destroy();
		delete listeners.current?.[url];
	}

	async function refresh(delay = 1000) {
		console.log('refresh....');
		setReloading(true);
		Object.keys(listeners.current).forEach((u) => disconnect(u));
		await new Promise((r) => setTimeout(r, delay));
		router.refresh();
		setReloading(false);
	}

	async function handleClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
		e.preventDefault();
		const {
			currentTarget: { href },
		} = e;
		try {
			if (!href) throw new Error('No href');
			setReloading(true);
			const res = await fetch(href, { method: 'GET' });
			if (res.ok) refresh(0);
		} catch (e) {
			console.log('error', e);
		} finally {
			setReloading(false);
		}
	}

	const style = {
		top: position === 'topleft' || position === 'topright' ? '0px' : 'auto',
		bottom: position === 'bottomleft' || position === 'bottomright' ? '0px' : 'auto',
		left: position === 'topleft' || position === 'bottomleft' ? '0px' : 'auto',
		right: position === 'bottomright' || position === 'topright' ? '0px' : 'auto',
	};

	if (!mounted) return null;

	return (
		<>
			<Modal>
				<div className={s.draft} style={style}>
					{contentEditingUrl && !insideiFrame && (dev || enabled) && (
						<a
							href={`/api/draft?secret=${secret ?? ''}&slug=${path}${!enabled ? '' : '&exit=1'}`}
							className={s.link}
							onClick={handleClick}
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
				{contentEditingUrl && enabled && path && (
					<ContentLink
						currentPath={pathname}
						enableClickToEdit={{ hoverOnly: true }}
						onNavigateTo={(item) => {
							console.log('DraftModeClient:', pathname, item);
							router.push(pathname);
						}}
					/>
				)}
			</Modal>
		</>
	);
}
