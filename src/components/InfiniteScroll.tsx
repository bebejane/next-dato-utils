'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export type InfiniteScrollProps<ComponetProps> = {
	id: string;
	initial: ComponetProps[];
	params?: Record<string, any>;
	next(offset: number, params?: Record<string, any>): Promise<ComponetProps[]>;
	children: React.JSXElementConstructor<ComponetProps>;
	loader?: React.ReactNode;
	rootMargin?: string;
};

export default function InfiniteScroll<ComponetProps>({
	id,
	initial,
	params,
	next: _next,
	children: Component,
	loader,
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
			const newData = await _next(data.length, params);
			setData((oldData) => {
				const d = [...oldData, ...newData];
				sessionStorage.setItem(id, JSON.stringify(d));
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
		const cached = sessionStorage.getItem(id);
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
			sessionStorage.removeItem(id);
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
				{loading && loader}
			</div>
			{error && <div style={{ color: 'red', marginTop: '1em' }}>{error}</div>}
		</>
	);
}
