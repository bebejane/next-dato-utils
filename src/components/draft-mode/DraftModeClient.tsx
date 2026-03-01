'use client';

import s from './DraftModeClient.module.css';
import { usePathname, useRouter } from 'next/navigation.js';
import { ContentLink } from 'react-datocms';
import { useEffect, useTransition, useRef, useState, use } from 'react';
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
	}, []);

	useEffect(() => {
		if (!enabled) return;

		console.log('setup focus');
		const handleVisibilityChange = () => {
			if (!document.hidden) {
				if (focused !== true) {
					console.log('refocused');
					refresh();
				}
				setFocused(true);
			} else setFocused(false);
		};

		window.addEventListener('focus', handleVisibilityChange);

		return () => {
			window.removeEventListener('focus', handleVisibilityChange);
		};
	}, [enabled]);

	useEffect(() => {
		if (!enabled) return;

		const interval = refreshRef.current;
		if (!focused && interval) clearInterval(interval);
		else refreshRef.current = setInterval(() => refresh(), refreshInterval);

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [enabled, focused]);

	useEffect(() => {
		if (!urls?.length || !enabled || loading) return;

		urls.forEach((u) => connect(u));

		return () => {
			console.log('unmount');

			urls.forEach((u) => disconnect(u));
		};
	}, [loading, urls, tag, path, enabled]);

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
			refresh();
		});
	}

	function disconnect(url: string) {
		listeners.current?.[url]?.destroy();
		delete listeners.current?.[url];
	}

	async function refresh() {
		console.log('refresh....');
		Object.keys(listeners.current).forEach((u) => disconnect(u));
		await new Promise((r) => setTimeout(r, 2000));
		router.refresh();
	}

	if (!mounted) return null;

	const style = {
		top: position === 'topleft' || position === 'topright' ? '0px' : 'auto',
		bottom: position === 'bottomleft' || position === 'bottomright' ? '0px' : 'auto',
		left: position === 'topleft' || position === 'bottomleft' ? '0px' : 'auto',
		right: position === 'bottomright' || position === 'topright' ? '0px' : 'auto',
	};

	return (
		<>
			<Modal>
				<div className={s.draft} style={style}>
					{contentEditingUrl && !insideiFrame && (dev || enabled) && (
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
				{contentEditingUrl && enabled && path && (
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
