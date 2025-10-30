'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import s from './DraftModeClient.module.css';
import { usePathname } from 'next/navigation.js';
import { useEffect, useTransition, useRef } from 'react';
import { sleep } from '../../utils/index.js';
export default function DraftMode({ enabled, draftUrl, tag, path, actions }) {
    const pathname = usePathname();
    const [loading, startTransition] = useTransition();
    const listener = useRef(null);
    const tags = tag ? (Array.isArray(tag) ? tag : [tag]) : [];
    const paths = path ? (Array.isArray(path) ? path : [path]) : [];
    useEffect(() => {
        if (!draftUrl || !enabled || listener?.current)
            return;
        const connect = () => {
            console.log('connecting to channel');
            let updates = 0;
            listener.current = new EventSource(draftUrl);
            listener.current.addEventListener('open', () => {
                console.log('connected to channel!');
            });
            listener.current.addEventListener('update', async (event) => {
                if (++updates <= 1)
                    return;
                console.log(event);
                startTransition(() => {
                    if (tags)
                        actions.revalidateTag(tags);
                    if (paths)
                        actions.revalidatePath(paths);
                });
            });
            listener.current.addEventListener('channelError', (err) => {
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
        return () => {
            disconnect();
        };
    }, [draftUrl, tag, path, enabled]);
    if (!enabled)
        return null;
    return (_jsxs("div", { className: s.draftMode, children: [_jsxs("div", { className: s.label, children: [_jsx("img", { className: `${s.image}  ${loading ? s.loading : undefined}`, width: '20', height: '20' }), _jsx("div", { children: "Draft mode" })] }), _jsx("div", { className: s.button, children: _jsx("button", { className: s.button, onClick: () => startTransition(() => actions.disableDraftMode(pathname)), children: "Exit" }) })] }));
}
//# sourceMappingURL=DraftModeClient.js.map