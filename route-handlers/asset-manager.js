import { NextResponse } from 'next/server';
import { basicAuth } from 'next-dato-utils/route-handlers';
import { waitUntil } from '@vercel/functions';
import { isValidateForResize, resizeAndUpload } from '../server-utils';
export default async function assetManager(req, config) {
    return basicAuth(req, async (req) => {
        try {
            if (!config?.assets)
                throw new Error('Missing asset config');
            console.log('asset manager webhook');
            const event = (await req.json());
            const { entity, entity_type, event_type } = event;
            if (!entity || !entity_type || !event_type)
                throw new Error('Missing entity, entity_type or event_type');
            if (entity_type !== 'upload')
                throw new Error('Invalid entity type: ' + entity_type);
            const { id } = entity;
            const upload = entity.attributes;
            if (!upload || !id)
                throw new Error('Missing upload data');
            const start = Date.now();
            const isValid = isValidateForResize(upload, config);
            if (isValid) {
                waitUntil(resizeAndUpload({ ...upload, id }, config)
                    .then((res) => console.log(res))
                    .catch((err) => console.error(err)));
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
        }
        catch (error) {
            const message = typeof error === 'string' ? error : error.message;
            console.log('error', message);
            return NextResponse.json({ success: false, message, error: JSON.stringify(error) });
        }
    });
}
//# sourceMappingURL=asset-manager.js.map