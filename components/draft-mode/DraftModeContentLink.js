'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { ContentLink as DatoContentLink, useContentLink } from 'react-datocms';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { hexToHsl } from '../../utils';
import { isCrossOriginFrame } from './DraftModeClient';
const basePath = '/api/draft';
export default function ContentLink({ color }) {
    const isDevPreview = process.env.NODE_ENV === 'development' &&
        process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL !== undefined &&
        process.env.NEXT_PUBLIC_DATOCMS_VISUAL_EDITING_PREVIEW !== undefined;
    const router = useRouter();
    const pathname = usePathname();
    const inIframe = isCrossOriginFrame();
    const heu = color ? hexToHsl(color)[0] : undefined;
    const [isDraft, setIsDraft] = useState(null);
    const [secret, setSecret] = useState(null);
    const [clickToEdit, setClickToEdit] = useState(false);
    const { isClickToEditEnabled, setCurrentPath } = useContentLink();
    async function check() {
        if (!inIframe)
            return;
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
        if (!secret || !inIframe || isDraft === null)
            return;
        console.log('toggle', draft);
        try {
            const params = new URLSearchParams({ secret });
            if (draft)
                params.append('slug', pathname);
            else
                params.append('exit', '1');
            const res = await fetch(`${basePath}?${params}`);
            if (!res.ok)
                throw new Error('toggle failed');
        }
        catch (e) {
            console.log(e);
            return;
        }
        console.log('refresh');
        router.refresh();
    }, [isDraft, secret, pathname, inIframe, clickToEdit]);
    useEffect(() => {
        if (!inIframe)
            return;
        async function handleVisibilityChange(e) {
            await fetch(`${basePath}?exit=1`);
        }
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [inIframe]);
    useEffect(() => {
        setCurrentPath(pathname);
        check();
    }, [pathname, clickToEdit]);
    useEffect(() => {
        toggle(clickToEdit);
    }, [clickToEdit]);
    useEffect(() => {
        if (!inIframe)
            return;
        const interval = setInterval(() => {
            setClickToEdit(isClickToEditEnabled());
        }, 400);
        return () => {
            clearInterval(interval);
        };
    }, [inIframe]);
    if (!inIframe || !isDevPreview)
        return null;
    return (_jsx(DatoContentLink, { onNavigateTo: (path) => {
            console.log('navigate', path);
            router.push(path);
        }, currentPath: pathname, enableClickToEdit: { hoverOnly: true }, hue: heu }));
}
//# sourceMappingURL=DraftModeContentLink.js.map