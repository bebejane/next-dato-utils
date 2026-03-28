'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { ContentLink as DatoContentLink, useContentLink } from 'react-datocms';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
export default function ContentLink() {
    const router = useRouter();
    const pathname = usePathname();
    const [isDraft, setIsDraft] = useState(false);
    const { isClickToEditEnabled } = useContentLink();
    const isEnabledRef = useRef(null);
    const isEnabled = isClickToEditEnabled();
    async function check() {
        try {
            const res = await fetch('/api/draft?check=1');
            setIsDraft((await res.text()) === '1');
        }
        catch (e) {
            console.log(e);
            setIsDraft(false);
        }
    }
    async function toggle() {
        try {
            const enable = isEnabledRef.current;
            console.log({ enable });
            if (enable === null)
                return;
            const url = new URL(window.location.href);
            const secret = url.searchParams.get('secret');
            console.log('toggle', { secret, enable });
            if (!secret)
                return;
            if (!enable) {
                console.log('disable draft', secret);
                const res = await fetch(`/api/draft?exit=1&secret=${secret}`);
                if (res.ok)
                    router.refresh();
            }
            else {
                console.log('enable draft', secret, `/api/draft?secret=${secret}&slug=${pathname}`);
                const res = await fetch(`/api/draft?secret=${secret}&slug=${pathname}`);
                if (res.ok)
                    router.refresh();
            }
        }
        catch (e) {
            //console.log(e);
        }
    }
    useEffect(() => {
        check();
    }, [pathname]);
    useEffect(() => {
        if (isEnabledRef.current === null && isEnabled)
            isEnabledRef.current = true;
        else if (isEnabledRef.current === true && !isEnabled)
            isEnabledRef.current = false;
        toggle();
    }, [isEnabled]);
    //if (!isDraft) return null;
    return (_jsx(DatoContentLink, { onNavigateTo: (path) => router.push(path), currentPath: pathname, enableClickToEdit: { hoverOnly: true } }));
}
//# sourceMappingURL=DraftModeContentLink.js.map