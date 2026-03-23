'use client';

import ReactDOM from 'react-dom';
import React from 'react';

export type ModalProps = {
	children?: any;
	targetId?: string;
};

const Modal = React.forwardRef<HTMLDivElement, ModalProps>((props, ref) => {
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, [mounted]);

	if (!mounted) return null;

	const target = props.targetId ? document.getElementById(props.targetId) : document.body;
	if (!target) throw new Error(`Modal target with id ${props.targetId} doesn't exists`);
	return ReactDOM.createPortal(props.children, target);
});

Modal.displayName = 'Modal';

export default Modal;
