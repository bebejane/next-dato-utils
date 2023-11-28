export type BlockProps = {
  data: any,
  onClick?: (ids: string) => void
  components: { [key: string]: JSX.Element }
}

export default function Block({ data, onClick, components }: BlockProps) {
  const type = data.__typename.replace('Record', '');
  const BlockComponent = components[type] as any;

  if (!BlockComponent)
    return <div>No block match: {data.__typename}</div>

  return <BlockComponent data={data} onClick={onClick} />
}