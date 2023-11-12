"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const actions_1 = require("../actions");
const DraftMode_module_scss_1 = __importDefault(require("./DraftMode.module.scss"));
const navigation_1 = require("next/navigation");
const react_1 = require("react");
const DraftModeServer_1 = __importDefault(require("./DraftModeServer"));
function DraftMode({ enabled, draftUrl, tag, path }) {
    const pathname = (0, navigation_1.usePathname)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (!draftUrl || !enabled)
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
    }, [draftUrl, tag, path, enabled]);
    if (!enabled)
        return null;
    return ((0, jsx_runtime_1.jsxs)("div", { className: DraftMode_module_scss_1.default.draftMode, children: [(0, jsx_runtime_1.jsxs)("div", { className: DraftMode_module_scss_1.default.label, children: [(0, jsx_runtime_1.jsx)("img", { width: "20", height: "20" }), (0, jsx_runtime_1.jsx)("div", { children: "Draft Mode" })] }), (0, jsx_runtime_1.jsx)(DraftModeServer_1.default, { path: pathname })] }));
}
exports.default = DraftMode;
//# sourceMappingURL=DraftMode.js.map