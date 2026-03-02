import EventEmitter from 'events';
export class DraftModeListener extends EventEmitter {
    id;
    url;
    source = null;
    status = null;
    timeout = null;
    reconnecting = false;
    updates = 0;
    retry = 3000;
    constructor(url) {
        super();
        this.url = url;
        this.id = new URL(url).pathname.split('/').pop();
        this.updates = 0;
        this.connect();
    }
    connect() {
        this.updates = 0;
        this.source = new EventSource(this.url);
        this.source.addEventListener('open', this._handleOpen.bind(this));
        this.source.addEventListener('update', this._handleUpdate.bind(this));
        this.source.addEventListener('disconnect', this._handleDisconnect.bind(this));
        this.source.addEventListener('channelError', this._handleChannelError.bind(this));
        this.source.addEventListener('error', this._handleError.bind(this));
        super.emit('connect', this.url);
        console.log('DraftModeListener: setup', this.url);
    }
    async reconnect() {
        if (this.reconnecting)
            return console.log('skipped reconnect');
        console.log('DraftModeListener: reconnect');
        this.destroy();
        this.reconnecting = true;
        await new Promise((r) => setTimeout(r, this.retry));
        this.connect();
        this.reconnecting = false;
    }
    disconnect() {
        console.log('DraftModeListener: disconnect');
        this.destroy();
    }
    destroy() {
        if (!this.source)
            return console.log('skip destroy');
        this.status && clearInterval(this.status);
        this.timeout && clearInterval(this.timeout);
        this.source.removeEventListener('open', this._handleOpen);
        this.source.removeEventListener('update', this._handleUpdate);
        this.source.removeEventListener('disconnect', this._handleDisconnect);
        this.source.removeEventListener('channelError', this._handleChannelError);
        this.source.removeEventListener('error', this._handleError);
        this.source.close();
        this.source = null;
        console.log('DraftModeListener:', 'destroyed', this.id);
    }
    _handleOpen(event) {
        console.log('DraftModeListener:', 'connected', this.id);
        this.status && clearInterval(this.status);
        this.timeout && clearInterval(this.timeout);
        this.status = setInterval(async () => {
            //console.log('.', this.id);
            this.source?.readyState === 2 && this.source.dispatchEvent(new Event('disconnect'));
        }, 2000);
        this.timeout = setInterval(async () => {
            //this.reconnect();
        }, 1000 * 60);
    }
    _handleDisconnect(event) {
        console.log('DraftModeListener:', 'disconnect', this.id);
        this.reconnect();
    }
    _handleUpdate(event) {
        if (++this.updates <= 1)
            return;
        console.log(event);
        super.emit('update', this.url);
    }
    _handleChannelError(err) {
        console.log('DraftModeListener: channel error');
        this.reconnect();
    }
    _handleError(err) {
        console.log('DraftModeListener: error', err);
        this.destroy();
        this.emit('error', err);
    }
}
//# sourceMappingURL=DraftModeListener.js.map