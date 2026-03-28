'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
export default function InfiniteScroll({ id, initial, params, next: _next, children: Component, loader, rootMargin, }) {
    const [data, setData] = useState([]);
    const ref = useRef(null);
    const [loading, setLoading] = useState(false);
    const [end, setEnd] = useState(false);
    const [error, setError] = useState(null);
    async function next() {
        if (end || loading)
            return;
        setLoading(true);
        setError(null);
        try {
            const newData = await _next(data.length, params);
            setData((oldData) => {
                const d = [...oldData, ...newData];
                sessionStorage.setItem(id, JSON.stringify(d));
                return d;
            });
            if (!newData.length)
                return setEnd(true);
        }
        catch (e) {
            setError(typeof e === 'string' ? e : e.message);
        }
        finally {
            setLoading(false);
        }
    }
    useLayoutEffect(() => {
        const cached = sessionStorage.getItem(id);
        const cachedData = cached ? JSON.parse(cached) : null;
        setData(cachedData ?? initial);
    }, [initial]);
    useEffect(() => {
        if (!ref.current || end)
            return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting)
                    next();
            });
        }, { rootMargin: rootMargin ?? '0px 0px 100% 0px' });
        observer.observe(ref.current);
        return () => {
            observer.disconnect();
        };
    }, [data, rootMargin, end]);
    useEffect(() => {
        function unload() {
            sessionStorage.removeItem(id);
        }
        window.addEventListener('beforeunload', unload);
        return () => {
            window.removeEventListener('beforeunload', unload);
        };
    }, []);
    return (_jsxs(_Fragment, { children: [data.map((item, index) => (_jsx(Component, { ...item, ref: index === data.length - 1 ? ref : null }, index))), _jsx("div", { ref: ref, style: { all: 'unset' }, children: loading && loader }), error && _jsx("div", { style: { color: 'red', marginTop: '1em' }, children: error })] }));
}
//# sourceMappingURL=InfiniteScroll.js.map