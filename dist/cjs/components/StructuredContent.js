"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_datocms_1 = require("react-datocms");
const datocms_structured_text_utils_1 = require("datocms-structured-text-utils");
function StructuredContent({ content, className, blocks, styles, onClick }) {
    if (!content)
        return null;
    return ((0, jsx_runtime_1.jsx)(react_datocms_1.StructuredText, { data: content, renderBlock: ({ record }) => {
            const Block = blocks[record?.__typename?.replace('Record', '')];
            if (!Block)
                return null;
            return (0, jsx_runtime_1.jsx)(Block, { data: record, onClick: (id) => onClick?.(id) });
        }, renderInlineRecord: ({ record }) => {
            switch (record.__typename) {
                default:
                    return null;
            }
        }, renderLinkToRecord: ({ record, children, transformedMeta }) => {
            switch (record.__typename) {
                default:
                    return null;
            }
        }, renderText: (text) => {
            // Replace nbsp
            return text?.replace(/\s/g, ' ');
        }, customNodeRules: [
            // Clenup paragraphs
            (0, react_datocms_1.renderNodeRule)(datocms_structured_text_utils_1.isParagraph, ({ adapter: { renderNode }, node, children, key, ancestors }) => {
                const firstChild = node.children[0];
                const lastChild = node.children[node.children.length - 1];
                // Remove trailing <br>
                if ((0, datocms_structured_text_utils_1.isRoot)(ancestors[0]) && lastChild.type === 'span' && lastChild.value?.endsWith('\n')) {
                    let index = node.children.length;
                    while (index >= 0 && firstChild.type === 'span' && firstChild.value[index] === '\n')
                        index--;
                    // remove trailing br
                    if (children && Array.isArray(children) && typeof children[0] === 'object')
                        Array.isArray(children[0].props.children) && children[0].props.children.splice(index);
                }
                ////@ts-ignore // Remove leading <br>
                if ((0, datocms_structured_text_utils_1.isRoot)(ancestors[0]) && firstChild.type === 'span' && firstChild.value.startsWith('\n')) {
                    let index = 0;
                    while (index < firstChild.value.length && firstChild.value[index] === '\n')
                        index++;
                    if (children && Array.isArray(children) && typeof children[0] === 'object')
                        Array.isArray(children[0].props.children) && children[0].props.children?.splice(0, index + 1);
                }
                // Filter out empty paragraphs
                children = children?.filter(c => !(typeof c === 'object' && c.props.children?.length === 1 && !c.props.children[0]));
                console.log(children?.length);
                // If no children remove tag completely
                if (!children?.length)
                    return null;
                const classNames = [];
                (0, datocms_structured_text_utils_1.isRoot)(ancestors[0]) && className && classNames.push(className);
                node.style && styles?.[node.style] && classNames.push(styles[node.style]);
                // Return paragraph with sanitized children
                return renderNode('p', {
                    key,
                    className: classNames.length ? classNames.join(' ') : undefined,
                }, children);
            }),
            // Add H classes
            (0, react_datocms_1.renderNodeRule)(datocms_structured_text_utils_1.isHeading, ({ adapter: { renderNode }, node, children, key, ancestors }) => {
                const classNames = [];
                node.style && styles?.[node.style] && classNames.push(styles[node.style]);
                return renderNode(`h${node.level}`, {
                    key,
                    className: classNames.length ? classNames.join(' ') : undefined,
                }, children);
            }),
            // Add mark classes
            (0, react_datocms_1.renderNodeRule)(datocms_structured_text_utils_1.isSpan, ({ adapter: { renderNode }, node, children, key, ancestors }) => {
                const classNames = [];
                styles && node.marks?.length && node.marks.forEach(mark => styles[mark] && classNames.push(styles[mark]));
                return renderNode('span', {
                    key,
                    className: classNames.length ? classNames.join(' ') : undefined,
                }, node.value);
            }),
        ] }));
}
exports.default = StructuredContent;
//# sourceMappingURL=StructuredContent.js.map