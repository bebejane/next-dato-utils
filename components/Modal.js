import ReactDOM from 'react-dom';
import React from 'react';
const Modal = React.forwardRef((props, ref) => {
    if (typeof window === 'undefined')
        return null;
    return ReactDOM.createPortal(props.children, document.body);
});
Modal.displayName = 'Modal';
export default Modal;
//# sourceMappingURL=Modal.js.map