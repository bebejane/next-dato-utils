'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { ContentLink as DatoContentLink, useContentLink } from 'react-datocms';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function ContentLink({ heu }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isDraft, setIsDraft] = useState(false);
    const [secret, setSecret] = useState(null);
    const [clickToEdit, setClickToEdit] = useState(false);
    const { isClickToEditEnabled, controller } = useContentLink();
    async function check() {
        try {
            const res = await fetch('/api/draft?check=1');
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
    async function toggle(enable) {
        try {
            const url = new URL(window.location.href);
            const path = url.pathname;
            console.log('toggle', { secret, enable, pathname, path, clickToEdit });
            if (!secret)
                return;
            if (!enable) {
                console.log('disable draft');
                const res = await fetch(`/api/draft?exit=1&secret=${secret}`);
                if (!res.ok)
                    return;
            }
            else {
                console.log('enable draft');
                const res = await fetch(`/api/draft?secret=${secret}&slug=${pathname}`);
                if (!res.ok)
                    return;
            }
        }
        catch (e) {
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
    console.log({ clickToEdit, isDraft });
    //if (!isDraft) return null;
    return (_jsx(DatoContentLink, { onNavigateTo: router.push, currentPath: pathname, enableClickToEdit: { hoverOnly: true }, hue: heu }));
}
//# sourceMappingURL=DraftModeContentLink.js.map