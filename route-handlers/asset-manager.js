import fs from 'fs';
import sharp from 'sharp';
import { NextResponse } from 'next/server';
import { buildClient, uploadLocalFileAndReturnPath } from '@datocms/cma-client-node';
import { basicAuth } from 'next-dato-utils/route-handlers';
import { formatBytes } from 'next-dato-utils/utils';
import { waitUntil } from '@vercel/functions';
const client = buildClient({
    apiToken: process.env.DATOCMS_API_TOKEN,
    environment: process.env.DATOCMS_ENVIRONMENT,
});
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
            const asset = entity.attributes;
            if (!asset || !id)
                throw new Error('Missing asset data');
            const start = Date.now();
            const isValid = validateAsset(asset, config.assets);
            async function resizeAndUpload() {
                if (!config.assets)
                    throw new Error('Missing asset config');
                console.log('resize and upload', asset.filename);
                const data = await resizeImage(asset, config.assets);
                const { newFilePath, newFilename } = data;
                const replace_strategy = asset.filename !== newFilename ? 'create_new_url' : 'keep_url';
                const upload = await client.uploads.update(id, { path: newFilePath }, { replace_strategy });
                const res = {
                    success: true,
                    id,
                    size: formatBytes(upload.size),
                    original: formatBytes(asset.size),
                    reduction: `-${formatBytes(asset.size - upload.size)}`,
                    filename: asset.filename,
                    newFilename,
                    replaceStrategy: replace_strategy,
                    duration: Date.now() - start,
                };
                return res;
            }
            if (isValid) {
                waitUntil(resizeAndUpload()
                    .then((res) => console.log(res))
                    .catch((err) => console.error(err)));
            }
            if (!isValid)
                return NextResponse.json({
                    success: false,
                    message: 'Asset within limits or wrong format',
                    filename: asset.filename,
                    duration: Date.now() - start,
                });
            else {
                return NextResponse.json({
                    success: true,
                    message: 'Generating new image',
                    filename: asset.filename,
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
function validateAsset(asset, { maxWidth, maxHeight }) {
    const format = asset.filename.split('.').pop();
    const formats = ['jpg', 'jpeg', 'tiff', 'tif'];
    if (!format)
        return false;
    if (!asset.is_image)
        return false;
    if (!formats.includes(format ?? ''))
        return false;
    if (asset.width <= maxWidth && asset.height <= maxHeight)
        return false;
    return true;
}
export async function resizeImage(asset, config) {
    const { url, filename, width, height } = asset;
    const { quality, maxHeight, maxWidth } = config;
    const response = await fetch(url);
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    sharp.concurrency(1);
    const buffer = await sharp(imageBuffer, { sequentialRead: true })
        .resize({
        width: width >= height ? maxWidth : undefined,
        height: height >= width ? maxHeight : undefined,
    })
        .jpeg({ quality, force: false })
        .tiff({ quality, force: false })
        .toFormat('jpeg')
        .toBuffer();
    const newFilename = `${filename.split('.').slice(0, -1).join('.')}.jpg`;
    const filePath = `/tmp/${newFilename}`;
    fs.writeFileSync(filePath, buffer);
    const newFilePath = await uploadLocalFileAndReturnPath(client, filePath, {
        filename: newFilename,
    });
    fs.rmSync(filePath);
    return { newFilePath, newFilename, buffer };
}
//# sourceMappingURL=asset-manager.js.map