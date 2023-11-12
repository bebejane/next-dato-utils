"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableDraftMode = void 0;
const headers_1 = require("next/headers");
const navigation_1 = require("next/navigation");
async function disableDraftMode(pathname) {
    console.log('disableDraftMode', pathname);
    (0, headers_1.draftMode)().disable();
    (0, navigation_1.redirect)(pathname ?? `/`);
}
exports.disableDraftMode = disableDraftMode;
//# sourceMappingURL=draft.js.map