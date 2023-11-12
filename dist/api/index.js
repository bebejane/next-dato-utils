var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./api-query"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.apiQuery = void 0;
    var api_query_1 = require("./api-query");
    Object.defineProperty(exports, "apiQuery", { enumerable: true, get: function () { return __importDefault(api_query_1).default; } });
});
//# sourceMappingURL=index.js.map