import { jsx as _jsx } from "react/jsx-runtime";
import { StructuredText, renderNodeRule, renderMarkRule } from 'react-datocms';
import { isParagraph, isHeading, isRoot } from 'datocms-structured-text-utils';
export default function StructuredContent({ content, className, blocks, styles,
//onClick
 }) {
    if (!content)
        return null;
    const customMarkRules = styles && Object.keys(styles).map(style => renderMarkRule(style, ({ mark, children, key }) => {
        return _jsx("span", { className: styles[style], children: children }, key);
    })) || [];
    return (_jsx(StructuredText, { data: content, renderBlock: ({ record }) => {
            const Block = blocks[record?.__typename?.replace('Record', '')];
            if (!Block)
                return null;
            return _jsx(Block, { data: record });
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
            // Replace nbsp, quotes and multiple spaces
            return text?.replace(/\s/g, ' ')?.replaceAll('"', '”');
        }, customMarkRules: customMarkRules, customNodeRules: [
            // Clenup paragraphs
            renderNodeRule(isParagraph, ({ adapter: { renderNode }, node, children, key, ancestors }) => {
                const firstChild = node.children[0];
                const lastChild = node.children[node.children.length - 1];
                // Remove trailing <br>
                if (isRoot(ancestors[0]) && lastChild.type === 'span' && lastChild.value?.endsWith('\n')) {
                    let index = node.children.length;
                    while (index >= 0 && firstChild.type === 'span' && firstChild.value[index] === '\n')
                        index--;
                    // remove trailing br
                    if (children && Array.isArray(children) && typeof children[0] === 'object')
                        Array.isArray(children[0].props.children) && children[0].props.children.splice(index);
                }
                ////@ts-ignore // Remove leading <br>
                if (isRoot(ancestors[0]) && firstChild.type === 'span' && firstChild.value.startsWith('\n')) {
                    let index = 0;
                    while (index < firstChild.value.length && firstChild.value[index] === '\n')
                        index++;
                    if (children && Array.isArray(children) && typeof children[0] === 'object')
                        Array.isArray(children[0].props.children) && children[0].props.children?.splice(0, index + 1);
                }
                // Filter out empty paragraphs
                children = children?.filter(c => !(typeof c === 'object' && c.props.children?.length === 1 && !c.props.children[0]));
                // If no children remove tag completely
                if (!children?.length)
                    return null;
                const classNames = [];
                isRoot(ancestors[0]) && className && classNames.push(className);
                node.style && styles?.[node.style] && classNames.push(styles[node.style]);
                node.style && !styles?.[node.style] && console.warn(node.style, 'does not exist in styles', 'P');
                // Return paragraph with sanitized children
                return renderNode('p', {
                    key,
                    className: classNames.length ? classNames.join(' ') : undefined,
                }, children);
            }),
            // Add H classes
            renderNodeRule(isHeading, ({ adapter: { renderNode }, node, children, key, ancestors }) => {
                const classNames = [];
                node.style && styles?.[node.style] && classNames.push(styles[node.style]);
                node.style && !styles?.[node.style] && console.warn(node.style, 'does not exist in styles', 'H');
                return renderNode(`h${node.level}`, {
                    key,
                    className: classNames.length ? classNames.join(' ') : undefined,
                }, children);
            })
        ] }));
}
//# sourceMappingURL=StructuredContent.js.map