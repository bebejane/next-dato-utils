'use client';

import { ContentLink as DatoContentLink, useContentLink } from 'react-datocms';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { hexToHsl } from '../../utils';
import { isCrossOriginFrame } from './DraftModeClient';

const basePath = '/api/draft';

export default function ContentLink({ color }: { color?: string }) {
	const isDevPreview =
		process.env.NODE_ENV === 'development' &&
		process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL !== undefined &&
		process.env.NEXT_PUBLIC_DATOCMS_VISUAL_EDITING_PREVIEW !== undefined;
	const router = useRouter();
	const pathname = usePathname();
	const inIframe = isCrossOriginFrame();
	const heu = color ? hexToHsl(color)[0] : undefined;
	const { setCurrentPath } = useContentLink();

	useEffect(() => {
		setCurrentPath(pathname);
	}, [pathname]);

	if (!inIframe || !isDevPreview) return null;

	return (
		<DatoContentLink
			onNavigateTo={(path) => {
				console.log('navigate', path);
				router.push(path);
			}}
			currentPath={pathname}
			enableClickToEdit={{ hoverOnly: true }}
			hue={heu}
		/>
	);
}
