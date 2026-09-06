import { jsx as _jsx } from "react/jsx-runtime";
export default function Block({ data, onClick, components, className }) {
    const type = data.__typename?.replace('Record', '');
    const BlockComponent = components?.[type];
    if (!BlockComponent) {
        console.warn(`No block match: ${data?.__typename}`);
        return null;
    }
    return _jsx(BlockComponent, { data: data, onClick: onClick, className: className });
}
//# sourceMappingURL=Block.js.map