'use client';

import { useEffect, useRef, useState } from 'react';
import { apiQuery, TypedDocumentNode } from 'next-dato-utils/api';
import { sleep } from 'next-dato-utils/utils';

export type InfiniteScrollProps<ComponetProps> = {
	id: string;
	initial: ComponetProps[];
	query: TypedDocumentNode;
	variables?: Record<string, any>;
	children: React.JSXElementConstructor<ComponetProps>;
	loader?: React.JSX.Element | null;
	error?: React.JSXElementConstructor<any>;
	rootMargin?: string;
	sleep?: number;
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
	sleep: _sleep,
}: InfiniteScrollProps<ComponetProps>): React.ReactNode {
	const [data, setData] = useState<ComponetProps[]>(
		storage?.getItem(id) ? JSON.parse(storage?.getItem(id) as string) : initial,
	);
	const ref = useRef<HTMLDivElement | null>(null);
	const [loading, setLoading] = useState(false);
	const [end, setEnd] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function next() {
		if (end || loading) return;
		setLoading(true);
		setError(null);

		try {
			if (_sleep) await sleep(_sleep); // simulate loading
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
			<div ref={ref}>{loading && Loader}</div>
			{error && Error ? (
				<Error>{error}</Error>
			) : (
				error && <div style={{ color: 'red', marginTop: '1em' }}>{error}</div>
			)}
		</>
	);
}
