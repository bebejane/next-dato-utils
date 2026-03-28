'use client';

import { ContentLink as DatoContentLink, useContentLink } from 'react-datocms';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { hexToHsl } from '../../utils';

const basePath = '/api/draft';

export default function ContentLink({ color }: { color?: string }) {
	const router = useRouter();
	const pathname = usePathname();
	const [isDraft, setIsDraft] = useState<boolean | null>(null);
	const [inIframe, setInIframe] = useState(false);
	const [secret, setSecret] = useState<string | null>(null);
	const [clickToEdit, setClickToEdit] = useState(false);
	const { isClickToEditEnabled } = useContentLink();

	async function check() {
		try {
			const res = await fetch(`${basePath}?check=1`);
			if (res.ok) {
				const { secret, enabled } = await res.json();
				setSecret(secret);
				setIsDraft(enabled);
			} else throw new Error('check failed');
		} catch (e) {
			console.log(e);
			setIsDraft(false);
			setSecret(null);
		}
	}

	const toggle = useCallback(
		async (draft: boolean) => {
			if (!secret || !inIframe || isDraft === null || (isDraft && clickToEdit)) return;
			console.log('toggle');
			try {
				const params = new URLSearchParams({ secret });
				if (draft) params.append('slug', pathname);
				else params.append('exit', '1');
				const res = await fetch(`${basePath}?${params}`);
				if (!res.ok) return;
			} catch (e) {
				console.log(e);
			}
			console.log('refresh');
			router.refresh();
		},
		[isDraft, secret, pathname, inIframe],
	);

	useEffect(() => setInIframe(window.self !== window.top), []);

	useEffect(() => {
		check();
	}, [pathname]);

	useEffect(() => {
		toggle(clickToEdit);
	}, [clickToEdit]);

	useEffect(() => {
		if (!inIframe) return;
		const interval = setInterval(() => {
			setClickToEdit(isClickToEditEnabled());
		}, 400);
		return () => clearInterval(interval);
	}, [inIframe]);

	console.log({ clickToEdit, isDraft });
	//if (!inIframe) return null;

	return (
		<DatoContentLink
			onNavigateTo={router.push}
			currentPath={pathname}
			enableClickToEdit={{ hoverOnly: true }}
			hue={color ? hexToHsl(color)[0] : undefined}
		/>
	);
}
