import ReactDOM from 'react-dom';
import React from 'react';

type ModalProps = {
	children: React.ReactElement | React.ReactElement[];
};

const Modal = React.forwardRef<HTMLDivElement, ModalProps>((props, ref) => {
	if (typeof window === 'undefined') return null;
	return ReactDOM.createPortal(props.children, document.body);
});

Modal.displayName = 'Modal';

export default Modal;
