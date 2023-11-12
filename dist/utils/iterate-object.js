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
    function iterateObject(obj, fn) {
        let i = 0, keys = [];
        if (Array.isArray(obj)) {
            for (; i < obj.length; ++i) {
                if (fn(obj[i], i, obj) === false)
                    break;
            }
        }
        else if (typeof obj === "object" && obj !== null) {
            keys = Object.keys(obj);
            for (; i < keys.length; ++i) {
                if (fn(obj[keys[i]], keys[i], obj) === false)
                    break;
            }
        }
    }
    exports.default = iterateObject;
});
//# sourceMappingURL=iterate-object.js.map