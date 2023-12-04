import { StructuredText, renderNodeRule } from 'react-datocms';
import { isParagraph, isRoot } from 'datocms-structured-text-utils';

export type Props = {
  content: any
  className?: string
  onClick?: (imageId: string) => void
  blocks?: any
}

export default function StructuredContent({ content, className, onClick, blocks }: Props) {

  if (!content)
    return null

  return (
    <StructuredText
      data={content}
      renderBlock={({ record }) => {
        const Block = blocks[record?.__typename?.replace('Record', '')]
        if (!Block) return null
        return <Block data={record} onClick={(id: string) => onClick?.(id)} />
      }}
      renderInlineRecord={({ record }) => {
        switch (record.__typename) {
          default:
            return null;
        }
      }}
      renderLinkToRecord={({ record, children, transformedMeta }) => {
        switch (record.__typename) {
          default:
            return null;
        }
      }}
      renderText={(text) => {
        // Replace nbsp
        return text?.replace(/\s/g, ' ');
      }}

      customNodeRules={[

        // Clenup paragraphs
        renderNodeRule(isParagraph, ({ adapter: { renderNode }, node, children, key, ancestors }) => {


          const firstChild = node.children[0]
          const lastChild = node.children[node.children.length - 1]

          // Remove trailing <br>
          if (isRoot(ancestors[0]) && lastChild.type === 'span' && lastChild.value?.endsWith('\n')) {

            let index = node.children.length;

            while (index >= 0 && firstChild.type === 'span' && firstChild.value[index] === '\n') index--;

            // remove trailing br
            if (children && Array.isArray(children) && typeof children[0] === 'object')
              Array.isArray(children[0].props.children) && children[0].props.children.splice(index)
          }

          ////@ts-ignore // Remove leading <br>
          if (isRoot(ancestors[0]) && firstChild.type === 'span' && firstChild.value.startsWith('\n')) {
            let index = 0;

            while (index < firstChild.value.length && firstChild.value[index] === '\n') index++;

            if (children && Array.isArray(children) && typeof children[0] === 'object')
              Array.isArray(children[0].props.children) && children[0].props.children?.splice(0, index + 1)
          }

          // Filter out empty paragraphs
          children = children?.filter(c => !(typeof c === 'object' && c.props.children.length === 1 && !c.props.children[0]))

          // If no children remove tag completely
          if (!children?.length) return null

          console.log(node)
          // Return paragraph with sanitized children
          return renderNode('p', {
            key,
            className: isRoot(ancestors[0]) ? className : undefined
          }, children)

        }),
      ]
      }
    />
  );
}
