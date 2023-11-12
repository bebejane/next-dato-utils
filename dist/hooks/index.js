var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./useScrollInfo", "./useApiQuery"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useApiQuery = exports.useScrollInfo = void 0;
    var useScrollInfo_1 = require("./useScrollInfo");
    Object.defineProperty(exports, "useScrollInfo", { enumerable: true, get: function () { return __importDefault(useScrollInfo_1).default; } });
    var useApiQuery_1 = require("./useApiQuery");
    Object.defineProperty(exports, "useApiQuery", { enumerable: true, get: function () { return __importDefault(useApiQuery_1).default; } });
});
//# sourceMappingURL=index.js.map