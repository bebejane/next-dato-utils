'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { apiQuery, TypedDocumentNode } from '../api';

export type InfiniteScrollProps<ComponetProps> = {
	id: string;
	initial: ComponetProps[];
	query: TypedDocumentNode;
	variables?: Record<string, any>;
	children: React.JSXElementConstructor<ComponetProps>;
	loader?: React.JSXElementConstructor<any>;
	error?: React.JSXElementConstructor<any>;
	rootMargin?: string;
};

const storage =
	typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
		? window.sessionStorage
		: null;

export default function InfiniteScroll<ComponetProps>({
	id,
	initial,
	query,
	variables,
	children: Component,
	loader: Loader,
	error: Error,
	rootMargin,
}: InfiniteScrollProps<ComponetProps>): React.ReactNode {
	const [data, setData] = useState<ComponetProps[]>([]);
	const ref = useRef<HTMLDivElement | null>(null);
	const [loading, setLoading] = useState(false);
	const [end, setEnd] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function next() {
		if (end || loading) return;
		setLoading(true);
		setError(null);

		try {
			const res = await apiQuery(query, { variables: { ...(variables ?? {}), skip: data.length } });
			const k = Object.keys(res).find((k) => !k.startsWith('_') && k !== 'draftUrl');

			if (!k) throw 'No data found';
			const newData = res[k] as ComponetProps[];

			setData((oldData) => {
				const d = [...oldData, ...newData];
				storage?.setItem(id, JSON.stringify(d));
				return d;
			});
			if (!newData.length) return setEnd(true);
		} catch (e) {
			setError(typeof e === 'string' ? e : (e as Error).message);
		} finally {
			setLoading(false);
		}
	}

	useLayoutEffect(() => {
		const cached = storage?.getItem(id) ?? null;
		const cachedData = cached ? JSON.parse(cached as string) : null;
		setData(cachedData ?? initial);
	}, [initial]);

	useEffect(() => {
		if (!ref.current || end) return;
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) next();
				});
			},
			{ rootMargin: rootMargin ?? '0px 0px 100% 0px' },
		);
		observer.observe(ref.current);

		return () => {
			observer.disconnect();
		};
	}, [data, rootMargin, end]);

	useEffect(() => {
		function unload() {
			storage?.removeItem(id);
		}

		window.addEventListener('beforeunload', unload);
		return () => {
			window.removeEventListener('beforeunload', unload);
		};
	}, []);

	return (
		<>
			{data.map((item, index) => (
				<Component key={index} {...item} ref={index === data.length - 1 ? ref : null} />
			))}
			<div ref={ref} style={{ all: 'unset' }}>
				{loading && Loader && <Loader />}
			</div>
			{error && Error ? (
				<Error>{error}</Error>
			) : (
				<div style={{ color: 'red', marginTop: '1em' }}>{error}</div>
			)}
		</>
	);
}
