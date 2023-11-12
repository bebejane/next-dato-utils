var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./DraftMode", "./Markdown"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Markdown = exports.DraftMode = void 0;
    var DraftMode_1 = require("./DraftMode");
    Object.defineProperty(exports, "DraftMode", { enumerable: true, get: function () { return __importDefault(DraftMode_1).default; } });
    var Markdown_1 = require("./Markdown");
    Object.defineProperty(exports, "Markdown", { enumerable: true, get: function () { return __importDefault(Markdown_1).default; } });
});
//# sourceMappingURL=index.js.map