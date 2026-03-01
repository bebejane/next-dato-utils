'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import s from './DraftModeClient.module.css';
import { usePathname, useRouter } from 'next/navigation.js';
import { ContentLink } from 'react-datocms';
import { useEffect, useTransition, useRef, useState } from 'react';
import Modal from '../Modal.js';
import { DraftModeListener } from './DraftModeListener.js';
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
    const refreshInterval = useRef(null);
    const listeners = useRef({});
    const urls = (_url ? (Array.isArray(_url) ? _url : [_url]) : []).filter((u) => u);
    useEffect(() => {
        setMounted(true);
    }, []);
    useEffect(() => {
        if (mounted) {
            refreshInterval.current = setInterval(() => {
                console.log('refresh');
                router.refresh();
            }, 1000 * 60);
        }
        return () => {
            if (refreshInterval.current) {
                clearInterval(refreshInterval.current);
            }
        };
    }, [mounted]);
    function disconnect(url) {
        listeners.current?.[url]?.destroy();
        delete listeners.current?.[url];
    }
    function connect(url) {
        const listener = new DraftModeListener(url);
        listeners.current[url] = listener;
        listener.on('update', (url) => {
            console.log('DraftModeClient: update', url);
            if (tags?.length === 0 && paths?.length === 0)
                return;
            console.log('DraftModeClient: revalidate', 'paths', paths, 'tags', tags);
            startTransition(() => {
                if (tags?.length)
                    actions.revalidateTag(tags);
                if (paths?.length)
                    actions.revalidatePath(paths, 'page');
            });
        });
        listener.on('connect', (url) => {
            console.log('DraftModeClient: connected to channel', url);
            listeners.current[url] = listener;
        });
        listener.on('disconnect', (url) => {
            console.log('DraftModeClient: disconnect', url);
            delete listeners.current[url];
            setTimeout(() => router.refresh(), 2000);
        });
        listener.on('error', (url) => {
            console.log('revalidate', url);
            setTimeout(() => router.refresh(), 2000);
        });
    }
    useEffect(() => {
        if (!urls?.length || !enabled || loading)
            return;
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
    return (_jsx(_Fragment, { children: _jsxs(Modal, { children: [_jsxs("div", { className: s.draft, style: style, children: [contentEditingUrl && !insideiFrame && (dev || enabled) && (_jsx("a", { href: `/api/draft?secret=${secret ?? ''}&slug=${path}${!enabled ? '' : '&exit=1'}`, className: s.link, onClick: () => setReloading(true), children: _jsx("button", { "aria-checked": enabled, className: s.button, children: reloading || loading ? (_jsx("div", { className: s.reloading, "data-draft": enabled })) : ('Draft') }) })), loading && !dev && _jsx("div", { className: s.loading, "data-draft": enabled })] }), contentEditingUrl && enabled && path && (_jsx(ContentLink, { currentPath: pathname, enableClickToEdit: { hoverOnly: true }, onNavigateTo: () => {
                        console.log('DraftModeClient:', pathname);
                        router.push(pathname);
                    } }))] }) }));
}
//# sourceMappingURL=DraftModeClient.js.map