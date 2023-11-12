var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./markdown-truncate", "./iterate-object"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.iterateObject = exports.markdownTruncate = void 0;
    var markdown_truncate_1 = require("./markdown-truncate");
    Object.defineProperty(exports, "markdownTruncate", { enumerable: true, get: function () { return __importDefault(markdown_truncate_1).default; } });
    var iterate_object_1 = require("./iterate-object");
    Object.defineProperty(exports, "iterateObject", { enumerable: true, get: function () { return __importDefault(iterate_object_1).default; } });
});
//# sourceMappingURL=index.js.map