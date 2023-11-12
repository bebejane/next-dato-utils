'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { revalidateTag, revalidatePath } from '../actions';
import s from './DraftMode.module.scss';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import DraftModeServer from './DraftModeServer';
export default function DraftMode({ enabled, draftUrl, tag, path }) {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
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
            setLoading(true);
            if (tag)
                await revalidateTag(tag);
            if (path)
                await revalidatePath(path);
            setLoading(false);
        });
        return () => {
            eventSource.close();
        };
    }, [draftUrl, tag, path, enabled]);
    if (!enabled)
        return null;
    return (_jsxs("div", { className: s.draftMode, children: [_jsxs("div", { className: s.label, children: [_jsx("img", { width: "20", height: "20" }), _jsx("div", { children: "Draft Mode" })] }), _jsx(DraftModeServer, { path: pathname })] }));
}
//# sourceMappingURL=DraftMode.js.map