"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_datocms_1 = require("react-datocms");
const datocms_structured_text_utils_1 = require("datocms-structured-text-utils");
function StructuredContent({ content, className, onClick, blocks }) {
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
                //@ts-ignore // Remove trailing <br>
                if ((0, datocms_structured_text_utils_1.isRoot)(ancestors[0]) && node.children[node.children.length - 1].value?.endsWith('\n')) {
                    //@ts-ignore
                    let index = node.children.length;
                    //@ts-ignore
                    while (index >= 0 && node.children[0].value && node.children[0].value[index] === '\n')
                        index--;
                    //console.log('remove trailing br', index)
                    //@ts-ignore
                    Array.isArray(children[0].props.children) && children[0].props.children.splice(index);
                }
                //@ts-ignore // Remove leading <br>
                if ((0, datocms_structured_text_utils_1.isRoot)(ancestors[0]) && node.children[0].value?.startsWith('\n')) {
                    let index = 0;
                    //@ts-ignore
                    while (index < node.children[0].value.length && node.children[0].value[index] === '\n')
                        index++;
                    //console.log('remove leading br', index)
                    //@ts-ignore
                    Array.isArray(children[0].props.children) && children[0].props.children?.splice(0, index + 1);
                }
                //@ts-ignore // Filter out empty paragraphs
                children = children.filter(c => !(c.props.children.length === 1 && !c.props.children[0]));
                // If no children remove tag completely
                if (!children.length)
                    return null;
                // Return paragraph with sanitized children
                return renderNode('p', {
                    key,
                    className: (0, datocms_structured_text_utils_1.isRoot)(ancestors[0]) ? className : undefined
                }, children);
            }),
        ] }));
}
exports.default = StructuredContent;
//# sourceMappingURL=StructuredContent.js.map