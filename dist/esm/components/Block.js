import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
export default function Block({ data, onClick, components }) {
    const type = data.__typename.replace('Record', '');
    const BlockComponent = components[type];
    if (!BlockComponent)
        return _jsxs("div", { children: ["No block match: ", data.__typename] });
    return _jsx(BlockComponent, { data: data, onClick: onClick });
}
//# sourceMappingURL=Block.js.map