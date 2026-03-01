import EventEmitter from 'events';
export declare class DraftModeListener extends EventEmitter {
    private id;
    private url;
    private source;
    private status;
    private timeout;
    private reconnecting;
    private updates;
    private retry;
    constructor(url: string);
    connect(): void;
    reconnect(): Promise<void>;
    disconnect(): void;
    destroy(): void;
    _handleOpen(event: any): void;
    _handleDisconnect(event: Event): void;
    _handleUpdate(event: any): void;
    _handleChannelError(err: any): void;
    _handleError(err: any): void;
}
