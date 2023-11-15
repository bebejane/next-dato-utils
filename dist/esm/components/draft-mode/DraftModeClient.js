'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import s from './DraftModeClient.module.scss';
import { usePathname } from 'next/navigation.js';
import { useEffect, useTransition, useRef } from 'react';
import { sleep } from '../../utils/index.js';
export default function DraftMode({ enabled, draftUrl, tag, path, actions }) {
    const pathname = usePathname();
    const [loading, startTransition] = useTransition();
    const listener = useRef(null);
    useEffect(() => {
        if (!draftUrl || !enabled || listener?.current) {
            console.log('not connecting to channel', { draftUrl, enabled, listener: listener?.current });
            return;
        }
        const connect = () => {
            console.log('connecting to channel');
            let updates = 0;
            listener.current = new EventSource(draftUrl);
            listener.current.addEventListener("open", () => {
                console.log("connected to channel!");
            });
            listener.current.addEventListener("update", async (event) => {
                if (++updates <= 1)
                    return;
                console.log(event);
                startTransition(() => {
                    if (tag)
                        actions.revalidateTag(tag);
                    if (path)
                        actions.revalidatePath(path);
                });
            });
            listener.current.addEventListener("channelError", (err) => {
                console.log('channel error');
                console.log(err);
            });
            const statusCheck = setInterval(async () => {
                if (listener.current?.readyState === 2) {
                    console.log('channel closed');
                    clearInterval(statusCheck);
                    await disconnect();
                    connect();
                }
            }, 1000);
        };
        const disconnect = async () => {
            if (listener.current) {
                listener.current.close();
                listener.current = null;
            }
            await sleep(1000);
        };
        connect();
        return () => { disconnect(); };
    }, [draftUrl, tag, path, enabled]);
    if (!enabled)
        return null;
    return (_jsxs("div", { className: s.draftMode, children: [_jsxs("div", { className: s.label, children: [_jsx("img", { width: "20", height: "20" }), _jsx("div", { children: "Draft Mode" })] }), _jsx("div", { className: s.button, children: _jsxs("button", { onClick: () => startTransition(() => actions.disableDraftMode(pathname)), children: ["Exit", loading && _jsx("div", { className: s.loading, children: _jsx("div", { className: s.loader }) })] }) })] }));
}
//# sourceMappingURL=DraftModeClient.js.map