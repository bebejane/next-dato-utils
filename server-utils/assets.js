import fs from 'fs';
import sharp from 'sharp';
import { buildClient, uploadLocalFileAndReturnPath } from '@datocms/cma-client-node';
import { formatBytes } from 'next-dato-utils/utils';
const client = buildClient({
    apiToken: process.env.DATOCMS_API_TOKEN,
    environment: process.env.DATOCMS_ENVIRONMENT,
});
export async function resizeAndUpload(upload, config) {
    if (!config.assets)
        throw new Error('Missing upload config');
    if (!isValidateForResize(upload, config))
        return null;
    console.log('resize and upload', upload.filename);
    const start = Date.now();
    const data = await resizeImage(upload, config);
    const { newFilePath, newFilename } = data;
    const replace_strategy = upload.filename !== newFilename ? 'create_new_url' : 'keep_url';
    const newUpload = await client.uploads.update(upload.id, { path: newFilePath }, { replace_strategy });
    const res = {
        success: true,
        id: newUpload.id,
        size: formatBytes(newUpload.size),
        original: formatBytes(upload.size),
        reduction: `-${formatBytes(upload.size - newUpload.size)}`,
        filename: upload.filename,
        newFilename,
        replaceStrategy: replace_strategy,
        duration: Date.now() - start,
    };
    return res;
}
export function isValidateForResize(upload, config) {
    if (!config.assets)
        throw new Error('Missing upload config');
    const format = upload.filename.split('.').pop();
    const formats = ['jpg', 'jpeg', 'tiff', 'tif'];
    if (!format)
        return false;
    if (!upload.is_image)
        return false;
    if (!upload.width || !upload.height)
        return false;
    if (!formats.includes(format ?? ''))
        return false;
    if (upload.width <= config.assets.maxWidth && upload.height <= config.assets.maxHeight)
        return false;
    return true;
}
export async function resizeImage(upload, config) {
    if (!config.assets)
        throw new Error('Missing upload config');
    const { url, filename, width, height } = upload;
    const { quality, maxHeight, maxWidth } = config.assets;
    if (!width || !height)
        throw new Error('Missing width or height');
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
//# sourceMappingURL=assets.js.map