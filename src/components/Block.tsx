export type BlockProps = {
	data: any;
	className?: string;
	onClick?: (ids: string) => void;
	components: any;
};

export default function Block({ data, onClick, components, className }: BlockProps) {
	const type = data.__typename?.replace('Record', '');
	const BlockComponent = components?.[type];

	if (!BlockComponent) {
		console.warn(`No block match: ${data?.__typename}`);
		return null;
	}
	return <BlockComponent data={data} onClick={onClick} className={className} />;
}
