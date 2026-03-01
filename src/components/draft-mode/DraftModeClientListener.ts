import EventEmitter from 'events';
import { startTransition } from 'react';

export class DraftModeClientListener extends EventEmitter {
	private url: string;
	private source: EventSource;
	private status: NodeJS.Timeout;
	private paths: string[];
	private tags: string[];
	private updates = 0;
	private actions: {
		revalidateTag: (tag: string | string[]) => void;
		revalidatePath: (path: string | string[], type: 'page' | 'layout') => void;
		disableDraftMode: (path: string) => void;
	};

	constructor(url: string, paths: string[], tags: string[], actions: any) {
		super();
		this.url = url;
		this.paths = paths;
		this.tags = tags;
		this.actions = actions;
		this.updates = 0;
		this.source = new EventSource(url);
		this.status = setInterval(async () => {
			this.source.readyState === 2 && this.source.dispatchEvent(new Event('disconnect'));
		}, 2000);
		this.emit('connect', this.url);
	}
	connect() {
		this.destroy();
		this.updates = 0;
		this.source = new EventSource(this.url);
		this.status = setInterval(async () => {
			this.source.readyState === 2 && this.source.dispatchEvent(new Event('disconnect'));
		}, 2000);
		this.emit('connect', this.url);
	}
	reconnect() {
		console.log('DraftModeClient: reconnect');
		this.connect();
	}
	disconnect() {
		console.log('DraftModeClient: disconnect');
		this.destroy();
	}
	destroy() {
		this.status && clearInterval(this.status);
		this.source.removeEventListener('open', this._handleOpen);
		this.source.removeEventListener('update', this._handleUpdate);
		this.source.removeEventListener('disconnect', this._handleDisconnect);
		this.source.removeEventListener('channelError', this._handleChannelError);
		this.source.removeEventListener('close', this._handleClose);
		this.source.removeEventListener('error', this._handleError);
		this.source.close();
		this.emit('disconnect', this.url);
		console.log('DraftModeClient: destroy', this.url);
	}
	_handleOpen(event: any) {
		this.emit('open', this.url);
	}
	_handleDisconnect(event: Event) {
		this.reconnect();
	}
	_handleUpdate(event: any) {
		if (++this.updates <= 1) {
			return;
		}
		console.log('DraftModeClient: update', event.origin);
		if (this.tags?.length === 0 && this.paths?.length === 0) return;

		console.log('DraftModeClient: revalidate', 'paths', this.paths, 'tags', this.tags);

		startTransition(() => {
			if (this.tags?.length) this.actions.revalidateTag(this.tags);
			if (this.paths?.length) this.actions.revalidatePath(this.paths, 'page');
		});
	}

	_handleChannelError(err: any) {
		console.log('DraftModeClient: channel error');
		this.reconnect();
	}

	_handleClose(event: any) {
		console.log('DraftModeClient: for real close');
	}

	_handleError(err: any) {
		console.log('DraftModeClient: error', err);
	}
}
