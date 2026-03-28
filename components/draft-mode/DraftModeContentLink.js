'use client';
import { createController } from '@datocms/content-link';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
const basePath = '/api/draft';
function isCrossOriginFrame() {
    if (typeof window === 'undefined')
        return false;
    try {
        return document.location.hostname !== window.parent.location.hostname;
    }
    catch (e) {
        return true;
    }
}
export default function ContentLink({ color }) {
    const router = useRouter();
    const pathname = usePathname();
    const inIframe = isCrossOriginFrame();
    const [isDraft, setIsDraft] = useState(null);
    const [secret, setSecret] = useState(null);
    const [clickToEdit, setClickToEdit] = useState(true);
    const controller = useRef(null);
    async function check() {
        try {
            const res = await fetch(`${basePath}?check=1`);
            if (res.ok) {
                const { secret, enabled } = await res.json();
                setSecret(secret);
                setIsDraft(enabled);
            }
            else
                throw new Error('check failed');
        }
        catch (e) {
            console.log(e);
            setIsDraft(false);
            setSecret(null);
        }
    }
    const toggle = useCallback(async (draft) => {
        console.log({ secret, inIframe, isDraft, clickToEdit });
        if (!secret || !inIframe || isDraft === null)
            return;
        console.log('toggle');
        try {
            const params = new URLSearchParams({ secret });
            if (draft)
                params.append('slug', pathname);
            else
                params.append('exit', '1');
            const res = await fetch(`${basePath}?${params}`);
            if (!res.ok)
                return;
        }
        catch (e) {
            console.log(e);
        }
        console.log('refresh');
        router.refresh();
    }, [isDraft, secret, pathname, inIframe]);
    useEffect(() => {
        if (!inIframe)
            return;
        controller.current = createController({ onNavigateTo: router.push });
        return () => controller.current?.dispose();
    }, []);
    useEffect(() => {
        check();
        // if (clickToEdit) controller.current?.enableClickToEdit();
        // else controller.current?.disableClickToEdit();
        controller.current?.setCurrentPath(pathname);
    }, [pathname, clickToEdit]);
    useEffect(() => {
        toggle(clickToEdit);
    }, [clickToEdit]);
    useEffect(() => {
        if (!inIframe || !controller.current)
            return;
        const interval = setInterval(() => {
            setClickToEdit(controller.current?.isClickToEditEnabled() ?? false);
        }, 400);
        return () => clearInterval(interval);
    }, [inIframe]);
    console.log({ clickToEdit, isDraft });
    //if (!inIframe) return null;
    return null;
    // 	return (
    // 		// <DatoContentLink
    // 		// 	onNavigateTo={router.push}
    // 		// 	currentPath={pathname}
    // 		// 	enableClickToEdit={{ hoverOnly: true }}
    // 		// 	hue={color ? hexToHsl(color)[0] : undefined}
    // 		// />
    // 	);
}
//# sourceMappingURL=DraftModeContentLink.js.map