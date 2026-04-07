import { NextResponse } from 'next/server';
import { basicAuth } from 'next-dato-utils/route-handlers';
import { waitUntil } from '@vercel/functions';
import { DatoCmsConfig } from '../config';
import { Upload } from '@datocms/cma-client/dist/types/generated/ApiTypes';
import { isValidateForResize, resizeAndUpload } from '../server-utils';

export default async function assetManager(req: Request, config: DatoCmsConfig) {
	return basicAuth(req, async (req: Request) => {
		try {
			if (!config?.assets) throw new Error('Missing asset config');
			console.log('asset manager webhook');
			const event = (await req.json()) as WebookEvent;
			const { entity, entity_type, event_type } = event;
			if (!entity || !entity_type || !event_type)
				throw new Error('Missing entity, entity_type or event_type');
			if (entity_type !== 'upload') throw new Error('Invalid entity type: ' + entity_type);

			const { id } = entity;
			const upload = entity.attributes;

			if (!upload || !id) throw new Error('Missing upload data');

			const start = Date.now();
			const isValid = isValidateForResize(upload, config);

			if (isValid) {
				waitUntil(
					resizeAndUpload({ ...upload, id }, config)
						.then((res) => console.log(res))
						.catch((err) => console.error(err)),
				);
			}

			if (!isValid)
				return NextResponse.json({
					success: false,
					message: 'Asset within limits or wrong format',
					filename: upload.filename,
					duration: Date.now() - start,
				});
			else {
				return NextResponse.json({
					success: true,
					message: 'Generating new image',
					filename: upload.filename,
					duration: Date.now() - start,
				});
			}
		} catch (error) {
			const message = typeof error === 'string' ? error : (error as Error).message;
			console.log('error', message);
			return NextResponse.json({ success: false, message, error: JSON.stringify(error) });
		}
	});
}

export type WebookEvent = {
	webhook_call_id: string;
	event_triggered_at: string;
	attempted_auto_retries_count: number;
	webhook_id: string;
	site_id: string;
	environment: string;
	is_environment_primary: boolean;
	entity_type: string;
	event_type: string;
	entity: {
		id: string;
		type: string;
		attributes: Upload;
		relationships: {
			creator: {
				data: {
					id: string;
					type: string;
				};
			};
			upload_collection: {
				data: any;
			};
		};
	};
	related_entities: Array<any>;
};
