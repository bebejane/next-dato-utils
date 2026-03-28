'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { ContentLink as DatoContentLink, useContentLink } from 'react-datocms';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function ContentLink() {
    const router = useRouter();
    const pathname = usePathname();
    const [isDraft, setIsDraft] = useState(false);
    const [secret, setSecret] = useState(null);
    const { isClickToEditEnabled, controller } = useContentLink();
    const isEnabled = isClickToEditEnabled();
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
            console.log('toggle', { secret, enable, pathname, path, isEnabled });
            if (!secret)
                return;
            if (!enable) {
                console.log('disable draft');
                const res = await fetch(`/api/draft?exit=1&secret=${secret}`);
                if (!res.ok)
                    return;
                controller?.disableClickToEdit();
            }
            else {
                console.log('enable draft');
                const res = await fetch(`/api/draft?secret=${secret}&slug=${path}`);
                if (!res.ok)
                    return;
                controller?.enableClickToEdit();
            }
        }
        catch (e) {
            console.log(e);
        }
        //console.log('refresh router');
        //router.refresh();
    }
    useEffect(() => {
        check();
    }, [pathname]);
    useEffect(() => {
        toggle(isEnabled);
    }, [isEnabled, secret, pathname]);
    //if (!isDraft) return null;
    console.log({ isEnabled, isDraft });
    return (_jsx(DatoContentLink, { onNavigateTo: (path) => router.push(path), currentPath: pathname, enableClickToEdit: { hoverOnly: true } }));
}
//# sourceMappingURL=DraftModeContentLink.js.map