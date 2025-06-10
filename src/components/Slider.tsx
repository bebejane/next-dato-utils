'use client';

import { useEffect, useRef, useState } from 'react';

export type SliderProps = {
	children: React.ReactElement<HTMLElement>;
	hide?: boolean;
	display?: 'flex' | 'block' | 'inline-block';
	speed?: number;
};

export default function Slider({ children, hide = false, display = 'flex', speed = 300 }: SliderProps) {
	const id = children?.props?.id;
	const [elementHeight, setElementHeight] = useState(0);
	const [{ height, width }, setDimensions] = useState({ height: 0, width: 0 });

	const ref = useRef<HTMLElement | null>(null);

	useEffect(() => {
		const element = document.getElementById(id);
		if (!element) return console.warn(`Slider: No element with id ${id} found`);
		ref.current = element;
		const transitions = [element.style.transition, `height ${speed}ms ease-out`].filter(Boolean);
		const dedupedTransitions = transitions.filter((t, i) => transitions.indexOf(t) === i);
		element.style.display = display;
		element.style.overflowY = 'hidden';
		element.style.transition = dedupedTransitions.join(',');
		if (!element.scrollHeight) return console.warn(`Slider: Element with id ${id} has no height`);
		setElementHeight(element.scrollHeight);
	}, [id, hide, speed, display, width, height]);

	useEffect(() => {
		if (!ref.current) return;
		const element = ref.current;
		element.style.height = hide ? '0px' : `${elementHeight}px`;
	}, [elementHeight, hide]);

	useEffect(() => {
		if (!ref.current) return;
		const handleResize = () => {
			setDimensions({ height: window.innerHeight, width: window.innerWidth });
		};
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return <>{children}</>;
}
