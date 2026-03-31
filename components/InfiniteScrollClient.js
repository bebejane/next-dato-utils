'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { apiQuery } from 'next-dato-utils/api';
import { sleep } from '../utils';
const storage = typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
    ? window.sessionStorage
    : null;
export default function InfiniteScroll({ id, initial, query, variables, children: Component, loader: Loader, error: Error, rootMargin, sleep: _sleep, }) {
    const [data, setData] = useState(storage?.getItem(id) ? JSON.parse(storage?.getItem(id)) : initial);
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
            if (_sleep)
                await sleep(_sleep); // simulate loading
            const res = await apiQuery(query, { variables: { ...(variables ?? {}), skip: data.length } });
            const k = Object.keys(res).find((k) => !k.startsWith('_') && k !== 'draftUrl');
            if (!k)
                throw 'No data found';
            const newData = res[k];
            setData((oldData) => {
                const d = [...oldData, ...newData];
                storage?.setItem(id, JSON.stringify(d));
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
            storage?.removeItem(id);
        }
        window.addEventListener('beforeunload', unload);
        return () => {
            window.removeEventListener('beforeunload', unload);
        };
    }, []);
    return (_jsxs(_Fragment, { children: [data.map((item, index) => (_jsx(Component, { ...item, ref: index === data.length - 1 ? ref : null }, index))), _jsx("div", { ref: ref, style: { all: 'unset' }, children: loading && Loader && _jsx(Loader, {}) }), error && Error ? (_jsx(Error, { children: error })) : (_jsx("div", { style: { color: 'red', marginTop: '1em' }, children: error }))] }));
}
//# sourceMappingURL=InfiniteScrollClient.js.map