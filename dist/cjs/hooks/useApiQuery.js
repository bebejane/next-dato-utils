"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const index_js_1 = require("../api/index.js");
const useApiQuery = (document, { variables, initialData, pageSize = 100, includeDrafts = false } = {}) => {
    const [initial, setInitial] = (0, react_1.useState)(initialData);
    const [data, setData] = (0, react_1.useState)(initialData);
    const [page, setPage] = (0, react_1.useState)(pageSize ? {
        no: 1,
        count: initialData.pagination?.count || 0,
        size: pageSize,
        end: initialData.pagination?.count > 0 ? initialData.pagination?.count <= pageSize : false
    } : undefined);
    const [error, setError] = (0, react_1.useState)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (JSON.stringify(initialData) !== JSON.stringify(initial)) {
            setData(initialData);
            setInitial(initialData);
        }
    }, [initialData]);
    const loadMore = (vars) => load(vars);
    const load = (0, react_1.useCallback)((vars) => {
        setLoading(true);
        return (0, index_js_1.apiQuery)(document, { variables: { ...variables, ...vars }, includeDrafts })
            .then(res => {
            const d = mergeData(res, data);
            setData(d);
            return d;
        })
            .finally(() => setLoading(false));
    }, [document, variables, data]);
    const nextPage = (0, react_1.useCallback)(async () => {
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
    (0, react_1.useEffect)(() => { !initialData && load(); }, [initialData, load]);
    return { data, error, loading, loadMore, nextPage, page };
};
exports.default = useApiQuery;
//# sourceMappingURL=useApiQuery.js.map