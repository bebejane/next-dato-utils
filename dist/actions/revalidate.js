(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "next/cache"], factory);
    }
})(function (require, exports) {
    "use strict";
    'use server';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.revalidatePath = exports.revalidateTag = void 0;
    const cache_1 = require("next/cache");
    async function revalidateTag(tag) {
        return (0, cache_1.revalidateTag)(tag);
    }
    exports.revalidateTag = revalidateTag;
    async function revalidatePath(path) {
        return (0, cache_1.revalidatePath)(path);
    }
    exports.revalidatePath = revalidatePath;
});
//# sourceMappingURL=revalidate.js.map