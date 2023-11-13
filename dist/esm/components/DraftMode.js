'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import s from './DraftMode.module.scss';
import { revalidateTag, revalidatePath, disableDraftMode } from '../actions';
import { usePathname } from 'next/navigation';
import { useEffect, useTransition } from 'react';
export default function DraftMode({ enabled, draftUrl, tag, path }) {
    const pathname = usePathname();
    const [loading, startTransition] = useTransition();
    console.log('draft mode', enabled, draftUrl, tag, path);
    useEffect(() => {
        if (!draftUrl || !enabled)
            return;
        let updates = 0;
        const eventSource = new EventSource(draftUrl);
        eventSource.addEventListener("open", () => {
            console.log("connected to channel!");
        });
        eventSource.addEventListener("update", async (event) => {
            if (++updates <= 1)
                return;
            startTransition(() => {
                if (tag)
                    revalidateTag(tag);
                if (path)
                    revalidatePath(path);
            });
        });
        return () => {
            eventSource.close();
        };
    }, [draftUrl, tag, path, enabled]);
    if (!enabled)
        return null;
    return (_jsxs("div", { className: s.draftMode, children: [_jsxs("div", { className: s.label, children: [_jsx("img", { width: "20", height: "20" }), _jsx("div", { children: "Draft Mode" })] }), _jsxs("button", { onClick: () => startTransition(() => {
                    console.log('exit draft mode');
                    disableDraftMode(pathname);
                }), children: ["Exit", loading && _jsx("div", { className: s.loading, children: _jsx("div", { className: s.loader }) })] })] }));
}
//# sourceMappingURL=DraftMode.js.map