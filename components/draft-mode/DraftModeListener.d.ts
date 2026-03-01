import EventEmitter from 'events';
export declare class DraftModeListener extends EventEmitter {
    private url;
    private source;
    private status;
    private timeout;
    private updates;
    constructor(url: string);
    connect(): void;
    reconnect(): void;
    disconnect(): void;
    destroy(): void;
    _handleOpen(event: any): void;
    _handleDisconnect(event: Event): void;
    _handleUpdate(event: any): void;
    _handleChannelError(err: any): void;
    _handleClose(event: any): void;
    _handleError(err: any): void;
}
