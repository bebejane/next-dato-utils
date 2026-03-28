'use client';

import { ContentLink as DatoContentLink, useContentLink } from 'react-datocms';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const basePath = '/api/draft';

export default function ContentLink({ heu }: { heu?: number }) {
	const router = useRouter();
	const pathname = usePathname();
	const [isDraft, setIsDraft] = useState(false);
	const [secret, setSecret] = useState<string | null>(null);
	const [clickToEdit, setClickToEdit] = useState(false);
	const { isClickToEditEnabled, controller } = useContentLink();

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

	async function toggle(draft: boolean) {
		try {
			if (!secret) return;

			const params = new URLSearchParams({ secret });
			if (draft) params.append('slug', pathname);
			else params.append('exit', '1');
			console.log(`${basePath}?${params}`);
			const res = await fetch(`${basePath}?${params}`);
			if (!res.ok) return;
		} catch (e) {
			console.log(e);
		}
		console.log('refresh router');
		router.refresh();
	}

	useEffect(() => {
		const interval = setInterval(() => {
			setClickToEdit(isClickToEditEnabled());
		}, 300);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		check();
	}, [pathname]);

	useEffect(() => {
		toggle(clickToEdit);
	}, [clickToEdit, secret, pathname]);

	if (isDraft) return null;

	return (
		<DatoContentLink
			onNavigateTo={router.push}
			currentPath={pathname}
			enableClickToEdit={{ hoverOnly: true }}
			hue={heu}
		/>
	);
}
