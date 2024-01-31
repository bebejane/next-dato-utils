import { jsx as _jsx } from "react/jsx-runtime";
import { StructuredText, renderNodeRule } from 'react-datocms';
import { isParagraph, isSpan, isHeading, isRoot } from 'datocms-structured-text-utils';
export default function StructuredContent({ content, className, blocks, styles, onClick }) {
    if (!content)
        return null;
    return (_jsx(StructuredText, { data: content, renderBlock: ({ record }) => {
            const Block = blocks[record?.__typename?.replace('Record', '')];
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
            }),
            // Add mark classes
            renderNodeRule(isSpan, ({ adapter: { renderNode }, node, children, key, ancestors }) => {
                if (node.value === '\n')
                    return renderNode('br', { key });
                const classNames = [];
                styles && node.marks?.length && node.marks.forEach(mark => {
                    styles[mark] && classNames.push(styles[mark]);
                    !styles[mark] && console.warn(mark, 'does not exist in styles', 'SPAN');
                });
                return renderNode('span', {
                    className: classNames.length ? classNames.join(' ') : undefined,
                }, node.value);
            }),
        ] }));
}
//# sourceMappingURL=StructuredContent.js.map