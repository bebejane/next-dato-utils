import React from 'react';
export type ModalProps = {
    children?: any;
    targetId?: string;
};
declare const Modal: React.ForwardRefExoticComponent<ModalProps & React.RefAttributes<HTMLDivElement>>;
export default Modal;
