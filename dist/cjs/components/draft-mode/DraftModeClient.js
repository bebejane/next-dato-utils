"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const DraftModeClient_module_scss_1 = __importDefault(require("./DraftModeClient.module.scss"));
const navigation_1 = require("next/navigation");
const react_1 = require("react");
const utils_1 = require("../../utils");
function DraftMode({ enabled, draftUrl, tag, path, actions }) {
    const pathname = (0, navigation_1.usePathname)();
    const [loading, startTransition] = (0, react_1.useTransition)();
    const listener = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (!draftUrl || !enabled || listener?.current)
            return;
        const connect = () => {
            let updates = 0;
            listener.current = new EventSource(draftUrl);
            listener.current.addEventListener("open", () => {
                console.log("connected to channel!");
            });
            listener.current.addEventListener("update", async (event) => {
                if (++updates <= 1)
                    return;
                console.log(event);
                startTransition(() => {
                    if (tag)
                        actions.revalidateTag(tag);
                    if (path)
                        actions.revalidatePath(path);
                });
            });
            listener.current.addEventListener("channelError", (err) => {
                console.log('channel error');
                console.log(err);
            });
            const statusCheck = setInterval(async () => {
                if (listener.current?.readyState === 2) {
                    console.log('channel closed');
                    clearInterval(statusCheck);
                    await disconnect();
                    connect();
                }
            }, 1000);
        };
        const disconnect = async () => {
            if (listener.current) {
                listener.current.close();
                listener.current = null;
            }
            await (0, utils_1.sleep)(1000);
        };
        return () => { disconnect(); };
    }, [draftUrl, tag, path, enabled]);
    if (!enabled)
        return null;
    return ((0, jsx_runtime_1.jsxs)("div", { className: DraftModeClient_module_scss_1.default.draftMode, children: [(0, jsx_runtime_1.jsxs)("div", { className: DraftModeClient_module_scss_1.default.label, children: [(0, jsx_runtime_1.jsx)("img", { width: "20", height: "20" }), (0, jsx_runtime_1.jsx)("div", { children: "Draft Mode" })] }), (0, jsx_runtime_1.jsx)("div", { className: DraftModeClient_module_scss_1.default.button, children: (0, jsx_runtime_1.jsxs)("button", { onClick: () => startTransition(() => actions.disableDraftMode(pathname)), children: ["Exit", loading && (0, jsx_runtime_1.jsx)("div", { className: DraftModeClient_module_scss_1.default.loading, children: (0, jsx_runtime_1.jsx)("div", { className: DraftModeClient_module_scss_1.default.loader }) })] }) })] }));
}
exports.default = DraftMode;
//# sourceMappingURL=DraftModeClient.js.map