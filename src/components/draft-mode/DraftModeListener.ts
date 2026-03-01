import EventEmitter from 'events';
//import { EventSource } from 'extended-eventsource';

import { sleep } from '../../utils/utilities.js';

export class DraftModeListener extends EventEmitter {
	private id: string;
	private url: string;
	private source: EventSource | null = null;
	private status: NodeJS.Timeout | null = null;
	private timeout: NodeJS.Timeout | null = null;
	private reconnecting = false;
	private updates = 0;
	private retry = 3000;

	constructor(url: string) {
		super();
		this.url = url;
		this.id = new URL(url).pathname.split('/').pop() as string;
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
		if (this.reconnecting) return console.log('skipped reconnect');
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
		if (!this.source) return console.log('skip destroy');
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
	_handleOpen(event: any) {
		console.log('DraftModeListener:', 'connected', this.id);
		this.status && clearInterval(this.status);
		this.timeout && clearInterval(this.timeout);

		this.status = setInterval(async () => {
			console.log('.', this.id);
			this.source?.readyState === 2 && this.source.dispatchEvent(new Event('disconnect'));
		}, 2000);

		this.timeout = setInterval(async () => {
			//this.reconnect();
		}, 1000 * 60);
	}
	_handleDisconnect(event: Event) {
		console.log('DraftModeListener:', 'disconnect', this.id);
		this.reconnect();
	}
	_handleUpdate(event: any) {
		if (++this.updates <= 1) return;
		console.log(event);
		super.emit('update', this.url);
	}
	_handleChannelError(err: any) {
		console.log('DraftModeListener: channel error');
		this.reconnect();
	}
	_handleError(err: any) {
		console.log('DraftModeListener: error', err);
		this.destroy();
		this.emit('error', err);
	}
}
