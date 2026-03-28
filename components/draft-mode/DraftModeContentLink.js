'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { ContentLink as DatoContentLink, useContentLink } from 'react-datocms';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { hexToHsl } from '../../utils';
const basePath = '/api/draft';
export default function ContentLink({ heu }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isDraft, setIsDraft] = useState(false);
    const [inIframe, setInIframe] = useState(false);
    const [secret, setSecret] = useState(null);
    const [clickToEdit, setClickToEdit] = useState(false);
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
    async function toggle(draft) {
        try {
            if (!secret)
                return;
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
        router.refresh();
    }
    useEffect(() => {
        toggle(clickToEdit);
    }, [clickToEdit, secret, pathname]);
    useEffect(() => {
        if (!inIframe)
            return;
        const interval = setInterval(() => {
            setClickToEdit(isClickToEditEnabled());
        }, 200);
        return () => clearInterval(interval);
    }, [inIframe]);
    useEffect(() => {
        check();
    }, [pathname]);
    useEffect(() => setInIframe(window.self !== window.top), []);
    if (!inIframe && !isDraft)
        return null;
    return (_jsx(DatoContentLink, { onNavigateTo: router.push, currentPath: pathname, enableClickToEdit: { hoverOnly: true }, hue: heu ? hexToHsl(heu)[0] : undefined }));
}
//# sourceMappingURL=DraftModeContentLink.js.map