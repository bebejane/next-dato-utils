'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import s from './DraftModeClient.module.css';
import { usePathname, useRouter } from 'next/navigation.js';
import { ContentLink } from 'react-datocms';
import { useEffect, useTransition, useRef, useState } from 'react';
import Modal from '../Modal.js';
import { DraftModeListener } from './DraftModeListener.js';
const refreshInterval = 1000 * 60 * 3;
export default function DraftModeClient({ enabled, url: _url, tag, path, actions, position, secret, }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, startTransition] = useTransition();
    const [reloading, setReloading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [focused, setFocused] = useState(null);
    const insideiFrame = typeof window !== 'undefined' && window.location !== window.parent.location;
    const dev = process.env.NODE_ENV === 'development';
    const contentEditingUrl = process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL;
    const tags = tag ? (Array.isArray(tag) ? tag : [tag]) : [];
    const paths = path ? (Array.isArray(path) ? path : [path]) : [];
    const refreshRef = useRef(null);
    const listeners = useRef({});
    const urls = (_url ? (Array.isArray(_url) ? _url : [_url]) : []).filter((u) => u);
    useEffect(() => {
        setMounted(true);
        if (!path)
            return;
        if (Array.isArray(path) ? path[0] !== pathname : path !== pathname)
            console.warn('DraftModeClient: path does not match current path', path, pathname);
    }, []);
    useEffect(() => {
        if (!enabled)
            return;
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                focused !== true && refresh(0);
                setFocused(true);
            }
            else
                setFocused(false);
        };
        window.addEventListener('focus', handleVisibilityChange);
        return () => window.removeEventListener('focus', handleVisibilityChange);
    }, [enabled]);
    useEffect(() => {
        if (!enabled)
            return;
        const interval = refreshRef.current;
        if (!focused && interval)
            clearInterval(interval);
        else
            refreshRef.current = setInterval(() => refresh(), refreshInterval);
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }, [enabled, focused]);
    useEffect(() => {
        if (!urls?.length || !enabled || loading)
            return;
        urls.forEach((u) => connect(u));
        return () => urls.forEach((u) => disconnect(u));
    }, [loading, urls, enabled]);
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
        });
        listener.on('disconnect', (url) => {
            delete listeners.current[url];
            refresh();
        });
        listener.on('error', (url) => {
            refresh();
        });
    }
    function disconnect(url) {
        listeners.current?.[url]?.destroy();
        delete listeners.current?.[url];
    }
    async function refresh(delay = 2000) {
        console.log('refresh....');
        Object.keys(listeners.current).forEach((u) => disconnect(u));
        await new Promise((r) => setTimeout(r, delay));
        router.refresh();
    }
    async function handleClick(e) {
        e.preventDefault();
        const { currentTarget: { href }, } = e;
        try {
            if (!href)
                throw new Error('No href');
            setReloading(true);
            const res = await fetch(href, { method: 'GET' });
            if (res.ok)
                refresh(0);
        }
        catch (e) {
            console.log('error', e);
        }
        finally {
            setReloading(false);
        }
    }
    const style = {
        top: position === 'topleft' || position === 'topright' ? '0px' : 'auto',
        bottom: position === 'bottomleft' || position === 'bottomright' ? '0px' : 'auto',
        left: position === 'topleft' || position === 'bottomleft' ? '0px' : 'auto',
        right: position === 'bottomright' || position === 'topright' ? '0px' : 'auto',
    };
    if (!mounted)
        return null;
    return (_jsx(_Fragment, { children: _jsxs(Modal, { children: [_jsxs("div", { className: s.draft, style: style, children: [contentEditingUrl && !insideiFrame && (dev || enabled) && (_jsx("a", { href: `/api/draft?secret=${secret ?? ''}&slug=${path}${!enabled ? '' : '&exit=1'}`, className: s.link, onClick: handleClick, children: _jsx("button", { "aria-checked": enabled, className: s.button, children: reloading || loading ? (_jsx("div", { className: s.reloading, "data-draft": enabled })) : ('Draft') }) })), loading && !dev && _jsx("div", { className: s.loading, "data-draft": enabled })] }), contentEditingUrl && enabled && path && (_jsx(ContentLink, { currentPath: pathname, enableClickToEdit: { hoverOnly: true }, onNavigateTo: (item) => {
                        console.log('DraftModeClient:', pathname, item);
                        router.push(pathname);
                    } }))] }) }));
}
//# sourceMappingURL=DraftModeClient.js.map