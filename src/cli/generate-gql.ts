import 'dotenv/config';
import { buildClient, Client } from '@datocms/cma-client';
import * as fs from 'fs';
import * as path from 'path';
import * as prettier from 'prettier';
import pluralize from 'pluralize';
import { Field, ItemType } from '@datocms/cma-client/dist/types/generated/ApiTypes.js';

let client: Client;

interface BlockValidator {
	item_types: string[];
}

// Helper functions
function toCamelCase(str: string): string {
	return str.replace(/([-_][a-z])/gi, ($1) => {
		return $1.toUpperCase().replace('-', '').replace('_', '');
	});
}

function toPascalCase(str: string): string {
	const camel = toCamelCase(str);
	return camel.charAt(0).toUpperCase() + camel.slice(1);
}

const imageFragmentContent = `fragment ImageFragment on FileFieldInterface {
	id
	width
	height
	alt
	basename
	format
	mimeType
	size
	title
	url
	responsiveImage {
		width
		height
		alt
		aspectRatio
		base64
		bgColor
		sizes
		src
		srcSet
		webpSrcSet
		title
	}
}`;

const fileFragmentContent = `fragment FileFragment on FileField {
	id
	width
	height
	alt
	basename
	format
	mimeType
	size
	title
	url
}`;

const imageThumbnailFragmentContent = `fragment ImageThumbnailFragment on FileField {
	alt
	basename
	format
	height
	id
	mimeType
	size
	title
	url
	width
	responsiveImage(imgixParams: { w: 800, h: 800, q: 50, auto: format, ar: "1:1", fit: crop }) {
		alt
		aspectRatio
		base64
		bgColor
		height
		sizes
		src
		srcSet
		webpSrcSet
		title
		width
	}
}`;

const mediaFragmentContent = `fragment MediaFragment on FileField {
	id
	alt
	basename
	format
	mimeType
	size
	title
	url
	width
	height
	responsiveImage {
		width
		height
		alt
		aspectRatio
		base64
		bgColor
		sizes
		src
		srcSet
		webpSrcSet
		title
	}
	video {
		thumbnailUrl
		streamingUrl
		mp4Url(res: high)
		mp4high: mp4Url(res: high)
		mp4med: mp4Url(res: medium)
		mp4low: mp4Url(res: low)
		framerate
		duration
	}
}`;

const videoFragmentContent = `fragment VideoFragment on VideoFileField {
	id
	alt
	basename
	format
	mimeType
	size
	title
	url
	width
	height
	video {
		thumbnailUrl
		streamingUrl
		mp4Url(res: high)
		mp4high: mp4Url(res: high)
		mp4med: mp4Url(res: medium)
		mp4low: mp4Url(res: low)
		framerate
		duration
	}
}`;

const siteFragmentContent = `fragment SiteFragment on Site {
	faviconMetaTags {
		attributes
		content
		tag
	}
	globalSeo {
		facebookPageUrl
		siteName
		titleSuffix
		twitterAccount
		fallbackSeo {
			description
			title
			twitterCard
			image {
				...ImageFragment
			}
		}
	}
}
`;

const videoFieldFragmentContent = `fragment VideoFieldFragment on VideoField {
	height
	width
	provider
	providerUid
	thumbnailUrl
	title
	url
}`;

const fragments = [
	imageFragmentContent,
	fileFragmentContent,
	videoFieldFragmentContent,
	imageThumbnailFragmentContent,
	mediaFragmentContent,
	siteFragmentContent,
	videoFragmentContent,
];

const modelMap = new Map<
	string,
	{
		apiKey: string;
		apiKeyPlural: string;
		pascalName: string;
		pascalNamePlural: string;
		camelName: string;
		camelNamePlural: string;
		singleton: boolean;
	}
>();
let itemTypes: ItemType[] = [];
let models: ItemType[] = [];

export default async function generateGqlFiles() {
	const DATOCMS_API_TOKEN = process.env.DATOCMS_API_TOKEN;

	if (!DATOCMS_API_TOKEN) {
		console.error('DATOCMS_API_TOKEN environment variable is not set.');
		process.exit(1);
	}

	client = buildClient({ apiToken: DATOCMS_API_TOKEN });
	const gqlDir = path.join(process.cwd(), 'gql');
	const fragmentsDir = path.join(gqlDir, 'fragments');

	try {
		// Create directories if they don't exist
		if (!fs.existsSync(gqlDir)) {
			fs.mkdirSync(gqlDir);
		}
		if (!fs.existsSync(fragmentsDir)) {
			fs.mkdirSync(fragmentsDir);
		}

		fragments.forEach((fragment: string) => {
			fs.writeFileSync(path.join(fragmentsDir, fragment.split(' ')[1] + '.gql'), fragment);
			console.log('Created gql/fragments/' + fragment.split(' ')[1] + '.gql');
		});

		models = await client.itemTypes.list();
		itemTypes = await client.itemTypes.list();

		// Create a map of model IDs to their API keys and PascalCase names for easy lookup
		models.forEach((m) =>
			modelMap.set(m.id, {
				apiKey: m.api_key,
				apiKeyPlural: pluralize(m.api_key),
				pascalName: toPascalCase(m.api_key),
				pascalNamePlural: toPascalCase(pluralize(m.api_key)),
				camelName: toCamelCase(m.api_key),
				camelNamePlural: toCamelCase(pluralize(m.api_key)),
				singleton: m.has_singleton_item,
			})
		);

		for (const { modular_block, api_key, id, has_singleton_item } of models) {
			if (modular_block) {
				continue;
			}
			// Fetch fields for the current model
			const m = modelMap.get(id);
			if (!m) continue;

			const filename = path.join(gqlDir, `${api_key}.gql`);
			const fields = await client.fields.list(id);
			const queryFields = await Promise.all(fields.map((field) => generateField(id, field)));
			const haveSlug = fields.some((field) => field.api_key === 'slug') && !m.singleton;

			const params = haveSlug ? '($slug: String)' : '';
			const filter = haveSlug ? '(filter:{slug: {eq: $slug}})' : '';

			const fragment = `fragment ${m.pascalName}Fragment on ${m.pascalName}Record { ${queryFields.join('')} }`;
			const fragmentLight = `fragment ${m.pascalName}LightFragment on ${m.pascalName}Record { ${queryFields.join('')} }`;

			const query = `
        query ${m.pascalName}${params} {
          ${m.camelName}${filter} {
            ...${m.pascalName}Fragment
          }
        }`;

			const queryAll = `query All${m.pascalNamePlural}($first: IntType = 500, $skip: IntType = 0) {
          all${m.pascalNamePlural}(first: $first, skip: $skip) {
            ...${m.pascalName}Fragment
          }
					_all${m.pascalNamePlural}Meta{
						count
					}
        }`;

			const content = `
				${query}\n
				${!has_singleton_item ? `${queryAll}\n` : ''} 
				${fragment}\n
				${!has_singleton_item ? `${fragmentLight}\n` : ''}  
				`;
			try {
				await writeGraphqlFile(filename, content);
			} catch (error) {
				console.error('Error writing file', filename, error);
			}
		}
	} catch (error) {
		console.error('Error generating GraphQL files:', error);
	}
}

async function generateField(modelId: string, field: Field): Promise<string> {
	const fieldType = field.field_type;
	const apiKeyCamel = toCamelCase(field.api_key);
	let str: string = '';
	switch (fieldType) {
		case 'structured_text':
			const structuredTextBlocks = (field.validators.structured_text_blocks as BlockValidator)?.item_types;
			const structuredTextGql = await generateBlocks(structuredTextBlocks);
			if (structuredTextGql !== null) str = `${apiKeyCamel} { value links blocks { ${structuredTextGql} } }`;
			break;
		case 'rich_text':
			const richTextBlocks = (field.validators.rich_text_blocks as BlockValidator)?.item_types;
			const richTextGql = await generateBlocks(richTextBlocks);
			if (richTextGql !== null) str = `${apiKeyCamel} { ${richTextGql} }`;
			break;
		case 'link':
		case 'links':
			const linkBlocks =
				((field.validators as any).item_item_type as BlockValidator)?.item_types ??
				((field.validators as any).item_item_types as BlockValidator)?.item_types;
			const linkGql = await generateBlocks(linkBlocks);
			if (linkGql !== null) str = `${apiKeyCamel} { ${linkGql} }`;
			break;
		case 'single_block':
			const singleBlockBlocks = (field.validators.single_block_blocks as BlockValidator)?.item_types;
			const singleBlockGql = await generateBlocks(singleBlockBlocks);
			if (singleBlockGql !== null) str = `${apiKeyCamel} { ${singleBlockGql} }`;
			break;
		case 'file':
			//@ts-ignore
			const isVideoField = field.validators?.extension?.predefined_list === 'video';

			if (field.api_key.includes('image') || field.api_key.includes('logo')) {
				str = `${apiKeyCamel} { ...ImageFragment }`;
			} else if (field.api_key.includes('media')) {
				str = `${apiKeyCamel} { ...MediaFragment }`;
			} else if (isVideoField) {
				str = `${apiKeyCamel} { ...VideoFragment }`;
			} else str = `${apiKeyCamel} { ...FileFragment }`;
			break;
		case 'gallery':
			str = `${apiKeyCamel} { ...MediaFragment }`;
			break;
		case 'video':
			str = `${apiKeyCamel} { ...VideoFieldFragment }`;
			break;
		case 'seo':
			break;
		case 'lat_lon':
			str = '{ latitude longitude }';
			break;
		case 'color':
			str = `${apiKeyCamel} { hex, red, green, blue }`;
			break;
		default:
			str = `${apiKeyCamel}`;
			break;
	}

	return str ? `${str}\n` : '';
}

async function generateBlocks(blockIds: BlockValidator['item_types']): Promise<string | null> {
	if (!blockIds || blockIds?.length <= 0) return null;
	const modelIds = blockIds.filter((v, i, a) => a.indexOf(v) === i);
	const blockFields: { api_key?: string; fields: Field[] }[] = [];

	for (const id of modelIds) {
		blockFields.push({
			api_key: itemTypes.find((t) => t.id === id)?.api_key,
			fields: await client.fields.list(id),
		});
	}

	const blockQueries = await Promise.all(
		blockFields.map(async ({ api_key, fields }, idx) => {
			return (await Promise.all(fields.map((field) => generateField(modelIds[idx], field)))).join(' ');
		})
	);

	const gql = `
		${blockQueries
			.map((q, idx) =>
				typeof blockFields[idx]?.api_key === 'string' && q
					? `... on ${toPascalCase(blockFields[idx].api_key as string)}Record { ${q} }`
					: ''
			)
			.join('\n')}`;

	return gql;
}

async function writeGraphqlFile(filename: string, content: string) {
	try {
		const formattedGqlContent = await prettier.format(content, { parser: 'graphql' });
		fs.writeFileSync(filename, formattedGqlContent);
		console.log(`Created ${filename}`);
	} catch (error) {
		console.error('Error parsing gql', filename);
		//console.error(error);
		//console.log(content);
	}
}
