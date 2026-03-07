'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { ContentLink as DatoContentLink } from 'react-datocms';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function ContentLink() {
    const router = useRouter();
    const pathname = usePathname();
    const [isDraft, setIsDraft] = useState(false);
    useEffect(() => {
        fetch('/api/draft?check=1')
            .then(async (res) => {
            setIsDraft((await res.text()) === '1');
        })
            .catch((e) => {
            setIsDraft(false);
        });
    }, [pathname]);
    useEffect(() => {
        function handleMouseEnter(e) {
            if (!e.altKey)
                return;
            document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, keyCode: 18 }));
        }
        document.addEventListener('mouseenter', handleMouseEnter);
        return () => {
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [pathname]);
    if (!isDraft)
        return null;
    return (_jsx(DatoContentLink, { onNavigateTo: (path) => router.push(path), currentPath: pathname, enableClickToEdit: { hoverOnly: true } }));
}
//# sourceMappingURL=DraftModeContentLink.js.map