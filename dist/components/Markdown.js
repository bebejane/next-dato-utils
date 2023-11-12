var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "react/jsx-runtime", "react-markdown", "remark-gfm", "next/link.js", "../utils/markdown-truncate", "remark-breaks"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const jsx_runtime_1 = require("react/jsx-runtime");
    const react_markdown_1 = __importDefault(require("react-markdown"));
    const remark_gfm_1 = __importDefault(require("remark-gfm"));
    const link_js_1 = __importDefault(require("next/link.js"));
    const markdown_truncate_1 = __importDefault(require("../utils/markdown-truncate"));
    const remark_breaks_1 = __importDefault(require("remark-breaks"));
    const truncateSentances = (markdown, limit) => {
        if (!markdown)
            return markdown;
        const sentances = markdown.split('.');
        return sentances.length >= limit ? sentances.slice(0, limit).join(' ') + '...' : markdown;
    };
    const Markdown = ({ content, truncate, className, components, sentances = 1, allowedElements, scroll = true, disableBreaks = false }) => {
        const truncatedContent = (!truncate ? content ? truncateSentances(content, sentances) : content : (0, markdown_truncate_1.default)(content, { limit: truncate, ellipsis: true }));
        return ((0, jsx_runtime_1.jsx)(react_markdown_1.default, { remarkPlugins: disableBreaks ? [remark_gfm_1.default] : [remark_gfm_1.default, remark_breaks_1.default], className: className, children: truncatedContent, allowedElements: allowedElements, 
            //@ts-ignore
            components: components ?? {
                a: ({ children, href }) => (0, jsx_runtime_1.jsx)(link_js_1.default, { scroll: scroll, href: href, children: children[0] })
            } }));
    };
    exports.default = Markdown;
});
//# sourceMappingURL=Markdown.js.map