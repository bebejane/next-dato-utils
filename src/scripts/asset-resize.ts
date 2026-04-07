import 'dotenv/config';
import config from '@/datocms.config';
import { resizeAndUpload, isValidateForResize } from 'next-dato-utils/server-utils';
import { buildClient } from '@datocms/cma-client';
import { Upload } from '@datocms/cma-client/dist/types/generated/ApiTypes';
import { chunkArray, formatBytes } from 'next-dato-utils/utils';

const client = buildClient({
	apiToken: process.env.DATOCMS_API_TOKEN!,
	environment: process.env.DATOCMS_ENVIRONMENT,
});

(async () => {
	if (!config?.assets) {
		console.log('no assets in config');
		return;
	}
	console.log('resize all images for environment', process.env.DATOCMS_ENVIRONMENT, config?.assets);
	const uploads: Upload[] = [];
	const images = [];

	let size = 0;
	let sizeImages = 0;
	for await (const upload of client.uploads.listPagedIterator()) {
		uploads.push(upload);
	}

	for (const upload of uploads) {
		size += upload.size;
		if (isValidateForResize(upload, config)) {
			images.push(upload);
			sizeImages += upload.size;
		}
	}

	console.log('total:', formatBytes(size), uploads.length);
	console.log('images:', formatBytes(sizeImages), images.length);

	const chunks = chunkArray(images, 10);
	let count = 0;
	for (const chunk of chunks) {
		try {
			await Promise.all(
				chunk.map(async (image) => {
					await resizeAndUpload(image, config);
				}),
			);
			count += chunk.length;
		} catch (e) {
			console.log(e);
		}

		console.log(count, images.length);
	}
})();
