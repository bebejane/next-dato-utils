"use strict";
'use server';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const headers_js_1 = require("next/headers.js");
const index_js_1 = require("../../server-actions/index.js");
const DraftModeClient_js_1 = __importDefault(require("./DraftModeClient.js"));
async function DraftMode({ url, tag, path }) {
    if (!url || (!tag && !path))
        return null;
    return ((0, jsx_runtime_1.jsx)(DraftModeClient_js_1.default, { enabled: (0, headers_js_1.draftMode)().isEnabled, draftUrl: url, tag: tag, path: path, actions: { revalidateTag: index_js_1.revalidateTag, revalidatePath: index_js_1.revalidatePath, disableDraftMode: index_js_1.disableDraftMode } }));
}
exports.default = DraftMode;
//# sourceMappingURL=index.js.map