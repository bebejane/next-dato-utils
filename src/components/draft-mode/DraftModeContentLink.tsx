'use client';

import { ContentLink as DatoContentLink, useContentLink } from 'react-datocms';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ContentLink() {
	const router = useRouter();
	const pathname = usePathname();
	const [isDraft, setIsDraft] = useState(false);
	const { isClickToEditEnabled } = useContentLink();
	const isEnabled = isClickToEditEnabled();

	async function check() {
		try {
			const res = await fetch('/api/draft?check=1');
			setIsDraft((await res.text()) === '1');
		} catch (e) {
			console.log(e);
			setIsDraft(false);
		}
	}

	async function toggle(enable: boolean) {
		try {
			const url = new URL(window.location.href);
			//const res = await fetch('/api/draft?exit=1');
			console.log(enable, url);
			//setIsDraft(false);
		} catch (e) {
			//console.log(e);
		}
	}

	useEffect(() => {
		check();
	}, [pathname]);

	useEffect(() => {
		toggle(isEnabled);
	}, [isEnabled]);

	if (!isDraft) return null;

	return (
		<DatoContentLink
			onNavigateTo={(path) => router.push(path)}
			currentPath={pathname}
			enableClickToEdit={{ hoverOnly: true }}
		/>
	);
}
