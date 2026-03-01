'use client';

import s from './DraftModeClient.module.css';
import { usePathname, useRouter } from 'next/navigation.js';
import { ContentLink } from 'react-datocms';
import { useEffect, useTransition, useRef, useState } from 'react';
import Modal from '../Modal.js';
import { DraftModeClientListener } from './DraftModeClientListener.js';

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
	const insideiFrame = typeof window !== 'undefined' && window.location !== window.parent.location;
	const dev = process.env.NODE_ENV === 'development';
	const contentEditingUrl = process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL;
	const tags = tag ? (Array.isArray(tag) ? tag : [tag]) : [];
	const paths = path ? (Array.isArray(path) ? path : [path]) : [];
	const listeners = useRef<{ [key: string]: DraftModeClientListener }>({});
	const urls: string[] = (_url ? (Array.isArray(_url) ? _url : [_url]) : []).filter(
		(u) => u,
	) as string[];

	useEffect(() => {
		setMounted(true);
	}, []);

	function connect(url: string) {
		const listener = new DraftModeClientListener(url, paths, tags, actions);
		//listener.on('connect', (url) => console.log('DraftModeClient: connected to channel', url));
		//listener.on('disconnect', (url) => console.log('DraftModeClient: disconnect', url));
		listener.on('update', (url) => console.log('DraftModeClient: update', url));
		listeners.current[url] = listener;
	}

	function disconnect(url: string) {
		listeners.current?.[url]?.destroy();
	}

	useEffect(() => {
		if (!urls?.length || !enabled || loading) return;

		console.log('DraftModeClient (start):', urls, { loading, urls, tag, path, enabled });
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
