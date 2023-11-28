export type BlockProps = {
  data: any,
  onClick?: (ids: string) => void
  components: any
}

export default function Block({ data, onClick, components }: BlockProps) {
  const type = data.__typename.replace('Record', '');
  const BlockComponent = components[type];

  if (!BlockComponent)
    return <div>No block match: {data.__typename}</div>

  return <BlockComponent data={data} onClick={onClick} />
}