'use client';

import { ContentLink as DatoContentLink } from 'react-datocms';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ContentLink() {
	const router = useRouter();
	const pathname = usePathname();

	const [isDraft, setIsDraft] = useState(false);

	useEffect(() => {
		const cookies = document.cookie.split(';').reduce(
			(res, c) => {
				const [key, val] = c.trim().split('=').map(decodeURIComponent);
				try {
					return Object.assign(res, { [key]: JSON.parse(val) });
				} catch (e) {
					return Object.assign(res, { [key]: val });
				}
			},
			{} as Record<string, string | boolean | number>,
		);

		setIsDraft(cookies.draft === '1' || cookies.draft === 1);
	}, [pathname]);

	useEffect(() => {
		function handleMouseEnter(e: MouseEvent) {
			if (!e.altKey) return;

			document.body.dispatchEvent(
				new KeyboardEvent('keydown', { bubbles: true, cancelable: true, keyCode: 18 }),
			);
		}

		document.addEventListener('mouseenter', handleMouseEnter);

		return () => {
			document.removeEventListener('mouseenter', handleMouseEnter);
		};
	}, [pathname]);

	if (!isDraft) return null;

	return (
		<DatoContentLink
			onNavigateTo={(path) => router.push(path)}
			currentPath={pathname}
			enableClickToEdit={{ hoverOnly: true }}
		/>
	);
}
