import React from 'react';
export type ModalProps = {
    children: React.ReactElement | React.ReactElement[];
    targetId?: string;
};
declare const Modal: React.ForwardRefExoticComponent<ModalProps & React.RefAttributes<HTMLDivElement>>;
export default Modal;
