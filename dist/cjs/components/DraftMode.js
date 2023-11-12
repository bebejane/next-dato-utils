"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
//import s from './DraftMode.module.scss'
const navigation_1 = require("next/navigation");
const actions_1 = require("../actions");
const react_1 = require("react");
function DraftMode({ draftMode, draftUrl, tag, path }) {
    const s = {};
    const pathname = (0, navigation_1.usePathname)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const disable = async () => {
        console.log('disable draft mode');
        setLoading(true);
        await (0, actions_1.disableDraftMode)(pathname);
        setLoading(false);
    };
    (0, react_1.useEffect)(() => {
        if (!draftUrl)
            return;
        let updates = 0;
        const eventSource = new EventSource(draftUrl);
        eventSource.addEventListener("open", () => {
            console.log("connected to channel!");
        });
        eventSource.addEventListener("update", async (event) => {
            if (++updates <= 1)
                return;
            setLoading(true);
            if (tag)
                await (0, actions_1.revalidateTag)(tag);
            if (path)
                await (0, actions_1.revalidatePath)(path);
            setLoading(false);
        });
        return () => {
            eventSource.close();
        };
    }, [draftUrl, tag, path]);
    if (!draftMode)
        return null;
    return ((0, jsx_runtime_1.jsxs)("button", { onClick: disable, children: [(0, jsx_runtime_1.jsxs)("label", { children: ["Exit draft", loading && (0, jsx_runtime_1.jsx)("div", { children: "X" })] }), (0, jsx_runtime_1.jsx)("img", { width: "20", height: "20" })] }));
}
exports.default = DraftMode;
//# sourceMappingURL=DraftMode.js.map