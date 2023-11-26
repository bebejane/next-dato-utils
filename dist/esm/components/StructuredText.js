import { jsx as _jsx } from "react/jsx-runtime";
import { StructuredText as DatoStructuredText, renderNodeRule } from 'react-datocms';
import { isParagraph, isRoot } from 'datocms-structured-text-utils';
export default function StructuredText({ content, className, onClick, blocks }) {
    if (!content)
        return null;
    return (_jsx(DatoStructuredText, { data: content, renderBlock: ({ record }) => {
            console.log(record.__typename, blocks);
            const Block = blocks?.find((b) => b?.valueOf() === record.__typename.replace('Record', ''));
            if (!Block)
                return null;
            return _jsx(Block, { data: record, onClick: (id) => onClick?.(id) });
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
            renderNodeRule(isParagraph, ({ adapter: { renderNode }, node, children, key, ancestors }) => {
                //@ts-ignore // Remove trailing <br>
                if (isRoot(ancestors[0]) && node.children[node.children.length - 1].value?.endsWith('\n')) {
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
                if (isRoot(ancestors[0]) && node.children[0].value?.startsWith('\n')) {
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
                    className: isRoot(ancestors[0]) ? className : undefined
                }, children);
            }),
        ] }));
}
//# sourceMappingURL=StructuredText.js.map