"use strict";
'use server';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const headers_1 = require("next/headers");
const actions_1 = require("../../actions");
const DraftModeClient_1 = __importDefault(require("./DraftModeClient"));
async function DraftMode({ draftUrl, tag, path }) {
    return ((0, jsx_runtime_1.jsx)(DraftModeClient_1.default, { enabled: (0, headers_1.draftMode)().isEnabled, draftUrl: draftUrl, tag: tag, path: path, actions: { revalidateTag: actions_1.revalidateTag, revalidatePath: actions_1.revalidatePath, disableDraftMode: actions_1.disableDraftMode } }));
}
exports.default = DraftMode;
//# sourceMappingURL=index.js.map