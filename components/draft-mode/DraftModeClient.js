'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import s from './DraftModeClient.module.css';
import { usePathname, useRouter } from 'next/navigation.js';
import { ContentLink } from 'react-datocms';
import { useEffect, useTransition, useRef, useState } from 'react';
import { sleep } from '../../utils/index.js';
import Modal from '../Modal.js';
export default function DraftMode({ enabled, url: _url, tag, path, actions, position, secret, }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, startTransition] = useTransition();
    const [reloading, setReloading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const insideiFrame = typeof window !== 'undefined' && window.location !== window.parent.location;
    const dev = process.env.NODE_ENV === 'development';
    const contentEditingUrl = process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL;
    const tags = tag ? (Array.isArray(tag) ? tag : [tag]) : [];
    const paths = path ? (Array.isArray(path) ? path : [path]) : [];
    const listeners = useRef({});
    const urls = (_url ? (Array.isArray(_url) ? _url : [_url]) : []).filter((u) => u);
    useEffect(() => {
        setMounted(true);
    }, []);
    function disconnect(url) {
        const l = listeners.current[url];
        if (!l)
            return;
        clearInterval(l.status);
        clearInterval(l.reconnect);
        listeners.current[url].listener.close();
        delete listeners.current[url];
        console.log('DraftModeClient: diconnected', url);
    }
    async function reconnect(url) {
        console.log('DraftModeClient: reconnect');
        disconnect(url);
        await sleep(1000);
        connect(url);
    }
    async function connect(url) {
        let updates = 0;
        function destroy(url) {
            const l = listeners.current[url];
            if (l) {
                l.listener.removeEventListener('update', handleUpdate);
                l.listener.removeEventListener('disconnect', handleDisconnect);
                l.listener.removeEventListener('channelError', handleChannelError);
                l.listener.removeEventListener('close', handleClose);
                l.listener.removeEventListener('error', handleError);
                console.log('DraftModeClient: destroy', url);
                disconnect(url);
            }
        }
        const listener = new EventSource(url);
        const handleOpen = async (event) => {
            //destroy(url);
            console.log('DraftModeClient: connected to channel', url);
            listeners.current[url] = {
                url,
                listener,
                status: setInterval(async () => {
                    console.log('status', listener.readyState);
                    listener.readyState === 2 && listener.dispatchEvent(new Event('disconnect'));
                }, 2000),
                reconnect: setInterval(async () => {
                    destroy(url);
                    reconnect(url);
                }, 1000 * 20),
            };
        };
        const handleDisconnect = async (event) => {
            reconnect(url);
        };
        const handleUpdate = async (event) => {
            if (++updates <= 1) {
                return;
            }
            console.log('DraftModeClient: update', event.origin);
            if (tags?.length === 0 && paths?.length === 0)
                return;
            console.log('DraftModeClient: revalidate', 'paths', paths, 'tags', tags);
            startTransition(() => {
                if (tags?.length)
                    actions.revalidateTag(tags);
                if (paths?.length)
                    actions.revalidatePath(paths, 'page');
            });
        };
        const handleChannelError = async (err) => {
            console.log('DraftModeClient: channel error');
            reconnect(url);
        };
        const handleClose = async (event) => {
            console.log('DraftModeClient: for real close');
        };
        const handleError = async (err) => {
            console.log('DraftModeClient: error', err);
        };
        listener.addEventListener('open', handleOpen);
        listener.addEventListener('update', handleUpdate);
        listener.addEventListener('disconnect', handleDisconnect);
        listener.addEventListener('channelError', handleChannelError);
        listener.addEventListener('close', handleClose);
        listener.addEventListener('error', handleError);
    }
    useEffect(() => {
        if (!urls?.length || !enabled || loading)
            return;
        console.log('DraftModeClient (start):', urls);
        urls.forEach((u) => connect(u));
        return () => {
            console.log('unmount');
            urls.forEach((u) => disconnect(u));
        };
    }, [loading, urls, tag, path, enabled]);
    if (!mounted)
        return null;
    const style = {
        top: position === 'topleft' || position === 'topright' ? '0px' : 'auto',
        bottom: position === 'bottomleft' || position === 'bottomright' ? '0px' : 'auto',
        left: position === 'topleft' || position === 'bottomleft' ? '0px' : 'auto',
        right: position === 'bottomright' || position === 'topright' ? '0px' : 'auto',
    };
    //console.log({ contentEditingUrl, dev, enabled, path, pathname, secret, insideiFrame });
    return (_jsx(_Fragment, { children: _jsxs(Modal, { children: [_jsxs("div", { className: s.draft, style: style, children: [contentEditingUrl && !insideiFrame && (dev || enabled) && (_jsx("a", { href: `/api/draft?secret=${secret ?? ''}&slug=${path}${!enabled ? '' : '&exit=1'}`, className: s.link, onClick: () => setReloading(true), children: _jsx("button", { "aria-checked": enabled, className: s.button, children: reloading || loading ? (_jsx("div", { className: s.reloading, "data-draft": enabled })) : ('Draft') }) })), loading && !dev && _jsx("div", { className: s.loading, "data-draft": enabled })] }), contentEditingUrl && enabled && path && (_jsx(ContentLink, { currentPath: pathname, enableClickToEdit: { hoverOnly: true }, onNavigateTo: () => {
                        console.log('DraftModeClient:', pathname);
                        router.push(pathname);
                    } }))] }) }));
}
//# sourceMappingURL=DraftModeClient.js.map