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
            .then((res) => {
            setIsDraft(res.ok);
        })
            .catch((e) => {
            setIsDraft(false);
        });
    }, [pathname]);
    if (!isDraft)
        return null;
    return (_jsx(DatoContentLink, { onNavigateTo: (path) => router.push(path), currentPath: pathname, enableClickToEdit: { hoverOnly: true } }));
}
//# sourceMappingURL=DraftModeContentLink.js.map