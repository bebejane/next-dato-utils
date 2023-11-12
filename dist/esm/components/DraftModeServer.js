"use server";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { disableDraftMode } from '../actions';
export default async function DraftModeServer({ path }) {
    const disableDraftModeWithPathname = disableDraftMode.bind(null, path);
    return (_jsxs("form", { action: disableDraftModeWithPathname, children: [_jsx("input", { type: "hidden", name: "path", value: path }), _jsx("button", { type: "submit", children: "Disable Draft Mode" })] }));
}
//# sourceMappingURL=DraftModeServer.js.map