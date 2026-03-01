import EventEmitter from 'events';
export declare class DraftModeClientListener extends EventEmitter {
    private url;
    private source;
    private status;
    private paths;
    private tags;
    private updates;
    private actions;
    constructor(url: string, paths: string[], tags: string[], actions: any);
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
