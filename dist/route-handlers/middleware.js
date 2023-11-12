(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const handler = (...middleware) => async (request) => {
        let result;
        for (let i = 0; i < middleware.length; i++) {
            let nextInvoked = false;
            const next = async () => {
                nextInvoked = true;
            };
            result = await middleware[i](request, next);
            if (!nextInvoked) {
                break;
            }
        }
        if (result)
            return result;
        throw new Error('Your handler or middleware must return a NextResponse!');
    };
    exports.default = handler;
});
//# sourceMappingURL=middleware.js.map