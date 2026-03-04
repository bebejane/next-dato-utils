'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import s from './DraftModeClient.module.css';
import { usePathname, useRouter } from 'next/navigation.js';
import { createController } from '@datocms/content-link';
import { useEffect, useTransition, useRef, useState } from 'react';
import Modal from '../Modal.js';
import { DraftModeListener } from './DraftModeListener.js';
const refreshInterval = 1000 * 60 * 1;
export default function DraftModeClient({ enabled, url: _url, tag, path, actions, position, secret, }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, startTransition] = useTransition();
    const [reloading, setReloading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [focused, setFocused] = useState(null);
    const refreshRef = useRef(null);
    const controllerRef = useRef(null);
    const insideiFrame = typeof window !== 'undefined' && window.location !== window.parent.location;
    const dev = process.env.NODE_ENV === 'development';
    const contentEditingUrl = process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL;
    const tags = tag ? (Array.isArray(tag) ? tag : [tag]) : [];
    const paths = path ? (Array.isArray(path) ? path : [path]) : [];
    const refreshing = useRef(false);
    const listeners = useRef({});
    const urls = (_url ? (Array.isArray(_url) ? _url : [_url]) : []).filter((u) => u);
    useEffect(() => {
        setMounted(true);
        console.log('DraftModeClient:', 'mount');
        if (!path)
            return;
        if (Array.isArray(path) ? path[0] !== pathname : path !== pathname)
            console.warn('DraftModeClient: path does not match current path', path, pathname);
        if (!enabled)
            return;
        controllerRef.current = createController({ onNavigateTo: (url) => router.push(url) });
        if (!controllerRef.current.isClickToEditEnabled())
            controllerRef.current.disableClickToEdit();
        controllerRef.current.setCurrentPath(pathname);
        return () => {
            console.log('DraftModeClient:', 'unmount');
            controllerRef.current?.dispose();
        };
    }, [enabled, pathname]);
    useEffect(() => {
        if (!enabled)
            return;
        function handleVisibilityChange(e) {
            setFocused((f) => !document.hidden);
        }
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [enabled]);
    useEffect(() => {
        if (!enabled)
            return;
        console.log('connect un url change');
        urls?.forEach((u) => connect(u));
        return () => urls?.forEach((u) => disconnect(u));
    }, [enabled, JSON.stringify(urls)]);
    useEffect(() => {
        if (!enabled)
            return;
        if (focused === true)
            refresh();
        else if (focused === false)
            Object.keys(listeners.current).forEach((u) => disconnect(u));
    }, [enabled, focused]);
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
            listeners.current[url] = listener;
            refreshRef.current && clearInterval(refreshRef.current);
            refreshRef.current = setInterval(() => {
                console.log('refresh interval');
                refresh(0);
            }, refreshInterval);
        });
        listener.on('disconnect', (url) => {
            console.log('DraftModeClient: disconnect', url);
            refreshRef.current && clearInterval(refreshRef.current);
        });
        listener.on('error', (url) => {
            console.log('DraftModeClient:', 'error', url);
            refresh();
        });
        listener.connect();
    }
    function disconnect(url) {
        listeners.current?.[url]?.destroy();
        delete listeners.current?.[url];
    }
    async function refresh(delay = 1000) {
        if (refreshing.current)
            return;
        console.log('refresh....');
        setReloading(true);
        refreshing.current = true;
        refreshRef.current && clearInterval(refreshRef.current);
        await new Promise((r) => setTimeout(r, delay));
        router.refresh();
        refreshing.current = false;
        setReloading(false);
    }
    const style = {
        top: position === 'topleft' || position === 'topright' ? '0px' : 'auto',
        bottom: position === 'bottomleft' || position === 'bottomright' ? '0px' : 'auto',
        left: position === 'topleft' || position === 'bottomleft' ? '0px' : 'auto',
        right: position === 'bottomright' || position === 'topright' ? '0px' : 'auto',
    };
    if (!mounted)
        return null;
    return (_jsx(Modal, { children: _jsxs("div", { className: s.draft, style: style, children: [contentEditingUrl && !insideiFrame && (dev || enabled) && (_jsx("a", { className: s.link, href: `/api/draft?secret=${secret ?? ''}&slug=${path}${!enabled ? '' : '&exit=1'}`, onClick: () => setReloading(true), children: _jsx("button", { "aria-checked": enabled, className: s.button, children: reloading || loading ? (_jsx("div", { className: s.reloading, "data-draft": enabled })) : ('Draft') }) })), loading && !dev && _jsx("div", { className: s.loading, "data-draft": enabled })] }) }));
}
//# sourceMappingURL=DraftModeClient.js.map