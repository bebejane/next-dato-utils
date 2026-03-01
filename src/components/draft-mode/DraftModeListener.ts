import EventEmitter from 'events';
import { sleep } from '../../utils/utilities.js';

export class DraftModeListener extends EventEmitter {
	private url: string;
	private source: EventSource | null = null;
	private status: NodeJS.Timeout | null = null;
	private timeout: NodeJS.Timeout | null = null;
	private updates = 0;

	constructor(url: string) {
		super();
		this.url = url;
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
		this.source.addEventListener('close', this._handleClose.bind(this));
		this.source.addEventListener('error', this._handleError.bind(this));

		this.status = setInterval(async () => {
			this.source?.readyState === 2 && this.source.dispatchEvent(new Event('disconnect'));
		}, 2000);

		this.timeout = setInterval(async () => {
			//this.reconnect();
		}, 1000 * 60);

		console.log('DraftModeListener: connect', this.url);
		super.emit('connect', this.url);
	}
	reconnect() {
		console.log('DraftModeListener: reconnect');
		this.destroy();
		this.connect();
	}
	disconnect() {
		console.log('DraftModeListener: disconnect');
		this.destroy();
	}
	destroy() {
		if (!this.source) return console.log('skip destroy');
		this.status && clearInterval(this.status);
		this.timeout && clearInterval(this.timeout);

		this.source.removeEventListener('open', this._handleOpen);
		this.source.removeEventListener('update', this._handleUpdate);
		this.source.removeEventListener('disconnect', this._handleDisconnect);
		this.source.removeEventListener('channelError', this._handleChannelError);
		this.source.removeEventListener('close', this._handleClose);
		this.source.removeEventListener('error', this._handleError);
		this.source.close();
		this.source = null;
		console.log('DraftModeListener: destroy', this.url);
	}
	_handleOpen(event: any) {
		super.emit('connect', this.url);
	}
	_handleDisconnect(event: Event) {
		//this.reconnect();
	}
	_handleUpdate(event: any) {
		if (++this.updates <= 1) return;
		super.emit('update', this.url);
	}
	_handleChannelError(err: any) {
		console.log('DraftModeListener: channel error');
		//this.reconnect();
	}
	_handleClose(event: any) {
		console.log('DraftModeListener: for real close');
	}
	_handleError(err: any) {
		console.log('DraftModeListener: error', err);
	}
}
