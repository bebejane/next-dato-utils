"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cma_client_1 = require("@datocms/cma-client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
require("dotenv/config");
const prettier = __importStar(require("prettier"));
const pluralize_1 = __importDefault(require("pluralize"));
// Helper functions
function toCamelCase(str) {
    if (!str)
        return '';
    return str.replace(/([-_][a-z])/gi, ($1) => {
        return $1.toUpperCase().replace('-', '').replace('_', '');
    });
}
function toPascalCase(str) {
    if (!str)
        return '';
    const camel = toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
}
const DATOCMS_API_TOKEN = process.env.DATOCMS_API_TOKEN;
if (!DATOCMS_API_TOKEN) {
    console.error('DATOCMS_API_TOKEN environment variable is not set.');
    process.exit(1);
}
const client = (0, cma_client_1.buildClient)({ apiToken: DATOCMS_API_TOKEN });
const gqlDir = path.join(process.cwd(), 'gql');
const fragmentsDir = path.join(gqlDir, 'fragments');
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
const fragments = [imageFragmentContent, fileFragmentContent, videoFieldFragmentContent, imageThumbnailFragmentContent, mediaFragmentContent, siteFragmentContent];
const modelMap = new Map();
let itemTypes = [];
let models = [];
async function generateGqlFiles() {
    try {
        // Create directories if they don't exist
        if (!fs.existsSync(gqlDir)) {
            fs.mkdirSync(gqlDir);
        }
        if (!fs.existsSync(fragmentsDir)) {
            fs.mkdirSync(fragmentsDir);
        }
        fragments.forEach(fragment => {
            fs.writeFileSync(path.join(fragmentsDir, fragment.split(' ')[1] + '.gql'), fragment);
            console.log('Created gql/fragments/' + fragment.split(' ')[1] + '.gql');
        });
        models = await client.itemTypes.list();
        itemTypes = await client.itemTypes.list();
        // Create a map of model IDs to their API keys and PascalCase names for easy lookup
        models.forEach(m => modelMap.set(m.id, {
            apiKey: m.api_key,
            apiKeyPlural: (0, pluralize_1.default)(m.api_key),
            pascalName: toPascalCase(m.api_key),
            pascalNamePlural: toPascalCase((0, pluralize_1.default)(m.api_key)),
            camelName: toCamelCase(m.api_key),
            camelNamePlural: toCamelCase((0, pluralize_1.default)(m.api_key)),
            singleton: m.has_singleton_item
        }));
        for (const { modular_block, api_key, id, has_singleton_item } of models) {
            if (modular_block) {
                console.log('skipping modular block', api_key);
                continue;
            }
            // Fetch fields for the current model
            const m = modelMap.get(id);
            if (!m)
                continue;
            const filename = path.join(gqlDir, `${api_key}.gql`);
            const fields = await client.fields.list(id);
            const queryFields = await Promise.all(fields.map(field => generateField(id, field)));
            const haveSlug = fields.some(field => field.api_key === 'slug') && !m.singleton;
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
            }
            catch (error) {
                console.error('Error writing file', filename, error);
            }
        }
    }
    catch (error) {
        console.error('Error generating GraphQL files:', error);
    }
}
exports.default = generateGqlFiles;
async function generateField(modelId, field) {
    const m = modelMap.get(modelId);
    const fieldType = field.field_type;
    const apiKeyCamel = toCamelCase(field.api_key);
    let str = '';
    switch (fieldType) {
        case 'structured_text':
            let blocksStr = '';
            const blocks = field.validators.structured_text_blocks;
            if (blocks && blocks?.item_types?.length > 0) {
                const blockModelIds = blocks.item_types;
                const blockFields = [];
                for (const id of blockModelIds) {
                    blockFields.push({
                        api_key: itemTypes.find(t => t.id === id)?.api_key,
                        fields: await client.fields.list(id)
                    });
                }
                const blockQueries = await Promise.all(blockFields.map(async ({ api_key, fields }, idx) => {
                    return (await Promise.all(fields.map(field => generateField(blockModelIds[idx], field)))).join(' ');
                }));
                blocksStr = `{ 
					${blockQueries.map((q, idx) => blockFields[idx]?.api_key ?
                    `... on ${toPascalCase(blockFields[idx]?.api_key)}Record { ${q} }` : '').join('\n')}}`;
            }
            str = `${apiKeyCamel} { value links blocks${blocksStr}}`;
            break;
        case 'rich_text':
            let richText = '';
            const richTextBlocks = field.validators.rich_text_blocks;
            if (richTextBlocks && richTextBlocks?.item_types?.length > 0) {
                const richTextModelIds = richTextBlocks.item_types;
                const richTextFields = [];
                for (const id of richTextModelIds) {
                    richTextFields.push({
                        api_key: itemTypes.find(t => t.id === id)?.api_key,
                        fields: await client.fields.list(id)
                    });
                }
                const richTextQueries = await Promise.all(richTextFields.map(async ({ api_key, fields }, idx) => {
                    return (await Promise.all(fields.map(field => generateField(richTextModelIds[idx], field)))).join(' ');
                }));
                richText = `${richTextQueries.map((q, idx) => richTextFields[idx]?.api_key ?
                    `... on ${toPascalCase(richTextFields[idx].api_key)}Record { ${q} }` : '').join('\n')}`;
            }
            str = `${apiKeyCamel} { ${richText} }`;
            break;
        case 'file':
            if (field.api_key.includes('image') || field.api_key.includes('logo')) {
                str = `${apiKeyCamel} { ...ImageFragment }`;
            }
            else if (field.api_key.includes('media')) {
                str = `${apiKeyCamel} { ...MediaFragment }`;
            }
            else
                str = `${apiKeyCamel} { ...FileFragment }`;
            break;
        case 'gallery':
            str = `${apiKeyCamel} { ...MediaFragment }`;
            break;
        case 'video':
            str = `${apiKeyCamel} { ...VideoFieldFragment }`;
            break;
        case 'link':
        case 'links':
            //@ts-ignore
            const validators = field.validators.item_item_type?.item_types ?? field.validators.item_item_types?.item_types;
            ;
            if (validators && validators?.length > 0) {
                const linkModelIds = validators;
                const linkFields = [];
                for (const id of linkModelIds) {
                    linkFields.push({
                        api_key: itemTypes.find(t => t.id === id)?.api_key,
                        fields: await client.fields.list(id)
                    });
                }
                str = `${apiKeyCamel} { 
					__typename
					${linkFields.map(({ api_key }, idx) => api_key ?
                    `... on ${toPascalCase(api_key)}Record { ...${toPascalCase(api_key)}Fragment }`
                    : '').join('\n')}}`;
            }
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
async function writeGraphqlFile(filename, content) {
    try {
        const formattedGqlContent = await prettier.format(content, { parser: 'graphql' });
        fs.writeFileSync(filename, formattedGqlContent);
        console.log(`Created ${filename}`);
    }
    catch (error) {
        console.error('Error parsing gql', filename);
    }
}
generateGqlFiles();
//# sourceMappingURL=generate-gql2.js.map