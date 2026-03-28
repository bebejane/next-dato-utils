'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { ContentLink as DatoContentLink, useContentLink } from 'react-datocms';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { hexToHsl } from '../../utils';
const basePath = '/api/draft';
function isCrossOriginFrame() {
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
    const [isDraft, setIsDraft] = useState(null);
    const [inIframe, setInIframe] = useState(false);
    const [secret, setSecret] = useState(null);
    const [clickToEdit, setClickToEdit] = useState(true);
    const { isClickToEditEnabled } = useContentLink();
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
        if (!secret || !inIframe || isDraft === null || (isDraft && clickToEdit))
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
    useEffect(() => setInIframe(isCrossOriginFrame()), []);
    useEffect(() => {
        check();
    }, [pathname]);
    useEffect(() => {
        toggle(clickToEdit);
    }, [clickToEdit]);
    useEffect(() => {
        if (!inIframe)
            return;
        const interval = setInterval(() => {
            setClickToEdit(isClickToEditEnabled());
        }, 400);
        return () => clearInterval(interval);
    }, [inIframe]);
    console.log({ clickToEdit, isDraft });
    //if (!inIframe) return null;
    return (_jsx(DatoContentLink, { onNavigateTo: router.push, currentPath: pathname, enableClickToEdit: { hoverOnly: true }, hue: color ? hexToHsl(color)[0] : undefined }));
}
//# sourceMappingURL=DraftModeContentLink.js.map