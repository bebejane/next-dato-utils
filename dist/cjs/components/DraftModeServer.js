"use strict";
"use server";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const actions_1 = require("../actions");
async function DraftModeServer({ path }) {
    const disableDraftModeWithPathname = actions_1.disableDraftMode.bind(null, path);
    return ((0, jsx_runtime_1.jsxs)("form", { action: disableDraftModeWithPathname, children: [(0, jsx_runtime_1.jsx)("input", { type: "hidden", name: "path", value: path }), (0, jsx_runtime_1.jsx)("button", { type: "submit", children: "Disable Draft Mode" })] }));
}
exports.default = DraftModeServer;
//# sourceMappingURL=DraftModeServer.js.map