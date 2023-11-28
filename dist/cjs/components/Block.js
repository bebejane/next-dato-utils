"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
function Block({ data, onClick, components }) {
    const type = data.__typename.replace('Record', '');
    const BlockComponent = components[type];
    if (!BlockComponent)
        return (0, jsx_runtime_1.jsxs)("div", { children: ["No block match ", data.__typename] });
    return (0, jsx_runtime_1.jsx)(BlockComponent, { data: data, onClick: onClick });
}
exports.default = Block;
//# sourceMappingURL=Block.js.map