'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import s from './DraftModeClient.module.css';
import { usePathname, useRouter } from 'next/navigation.js';
import { ContentLink } from 'react-datocms';
import { useEffect, useTransition, useRef, useState } from 'react';
import Modal from '../Modal.js';
import { sleep } from '../../utils/index.js';
export default function DraftMode({ enabled, draftUrl, tag, path, actions }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, startTransition] = useTransition();
    const [mounted, setMounted] = useState(false);
    const listener = useRef(null);
    const tags = tag ? (Array.isArray(tag) ? tag : [tag]) : [];
    const paths = path ? (Array.isArray(path) ? path : [path]) : [];
    useEffect(() => {
        setMounted(true);
    }, []);
    useEffect(() => {
        if (!draftUrl || !enabled || listener?.current)
            return;
        const connect = () => {
            console.log('DraftModeClient: connecting...');
            let updates = 0;
            listener.current = new EventSource(draftUrl);
            listener.current.addEventListener('open', () => {
                console.log('DraftModeClient: connected to channel');
            });
            listener.current.addEventListener('update', async (event) => {
                if (++updates <= 1)
                    return;
                console.log('DraftModeClient: update');
                console.log(event);
                try {
                    console.log(JSON.parse(event.data));
                }
                catch (e) { }
                console.log('revalidate', 'tags', tags);
                console.log('revalidate', 'paths', paths);
                startTransition(() => {
                    if (tags)
                        actions.revalidateTag(tags);
                    if (paths)
                        actions.revalidatePath(paths);
                });
            });
            listener.current.addEventListener('channelError', (err) => {
                console.log('DraftModeClient: channel error');
                console.log(err);
            });
            const statusCheck = setInterval(async () => {
                console.log(listener.current?.readyState);
                if (listener.current?.readyState === 2) {
                    console.log('DraftModeClient: channel closed');
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
                console.log('DraftModeClient: diconnected listener');
            }
            console.log('DraftModeClient: diconnected');
            await sleep(300);
        };
        connect();
        return () => {
            disconnect();
        };
    }, [draftUrl, tag, path, enabled]);
    if (!enabled || !mounted)
        return null;
    return (_jsx(_Fragment, { children: _jsxs(Modal, { children: [_jsx("div", { className: s.draftMode, children: loading ? _jsx("div", { className: s.loader }) : _jsx("span", {}) }), _jsx(ContentLink, { currentPath: pathname, onNavigateTo: () => router.push(pathname), enableClickToEdit: { hoverOnly: true } })] }) }));
}
//# sourceMappingURL=DraftModeClient.js.map