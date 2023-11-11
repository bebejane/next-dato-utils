"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
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
const Markdown = ({ children, truncate, className, components, sentances, allowedElements, scroll = true, disableBreaks = false }) => {
    if (!children)
        return null;
    const content = (!truncate ? children ? truncateSentances(children, sentances) : children : (0, markdown_truncate_1.default)(children, { limit: truncate, ellipsis: true }));
    return ((0, jsx_runtime_1.jsx)(react_markdown_1.default, { remarkPlugins: disableBreaks ? [remark_gfm_1.default] : [remark_gfm_1.default, remark_breaks_1.default], className: className, children: content, allowedElements: allowedElements, 
        //@ts-ignore
        components: components ?? {
            a: ({ children, href }) => (0, jsx_runtime_1.jsx)(link_js_1.default, { scroll: scroll, href: href, children: children[0] })
        } }));
};
exports.default = Markdown;
//# sourceMappingURL=Markdown.js.map