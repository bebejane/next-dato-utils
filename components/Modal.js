import ReactDOM from 'react-dom';
import React from 'react';
const Modal = React.forwardRef((props, ref) => {
    if (typeof window === 'undefined')
        return null;
    const target = props.targetId ? document.getElementById(props.targetId) : document.body;
    if (!target)
        throw new Error(`Modal target with id ${props.targetId} doesn't exists`);
    return ReactDOM.createPortal(props.children, target);
});
Modal.displayName = 'Modal';
export default Modal;
//# sourceMappingURL=Modal.js.map