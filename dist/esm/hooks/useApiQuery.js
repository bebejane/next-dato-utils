'use client';
import { useEffect, useState, useCallback } from "react";
import { apiQuery } from '../api/index.js';
const useApiQuery = (document, { variables, initialData, pageSize = 100, includeDrafts = false } = {}) => {
    const [initial, setInitial] = useState(initialData);
    const [data, setData] = useState(initialData);
    const [page, setPage] = useState(pageSize ? {
        no: 1,
        count: initialData.pagination?.count || 0,
        size: pageSize,
        end: initialData.pagination?.count > 0 ? initialData.pagination?.count <= pageSize : false
    } : undefined);
    const [error, setError] = useState();
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (JSON.stringify(initialData) !== JSON.stringify(initial)) {
            setData(initialData);
            setInitial(initialData);
        }
    }, [initialData]);
    const loadMore = (vars) => load(vars);
    const load = useCallback((vars) => {
        setLoading(true);
        return apiQuery(document, { variables: { ...variables, ...vars }, includeDrafts })
            .then((res) => {
            const d = mergeData(res, data);
            setData(d);
            return d;
        })
            .finally(() => setLoading(false));
    }, [document, variables, data]);
    const nextPage = useCallback(async () => {
        if (!page)
            return setError(new Error('No page size set!'));
        const first = page.size;
        const skip = page.no * page.size;
        if (skip > page.count && page.count > 0)
            return page;
        try {
            const d = await load({ ...variables.variables, first, skip });
            const k = Object.keys(d).find(k => typeof d[k].count === 'number');
            if (!k)
                throw new Error('No count found in response');
            const count = d[k]?.count || 0;
            const no = page.no + 1;
            const end = no * pageSize >= count;
            const p = { ...page, no, count, end };
            setPage(p);
            return p;
        }
        catch (err) {
            setError(err);
            return page;
        }
    }, [page, variables, pageSize, setPage, setError, load]);
    const mergeData = (newData, oldData) => {
        if (!oldData || !newData)
            return newData;
        Object.keys(newData).forEach(k => {
            if (oldData[k] && Array.isArray(oldData[k]))
                newData[k] = oldData[k].concat(newData[k]);
        });
        return newData;
    };
    useEffect(() => { !initialData && load(); }, [initialData, load]);
    return { data, error, loading, loadMore, nextPage, page };
};
export default useApiQuery;
//# sourceMappingURL=useApiQuery.js.map