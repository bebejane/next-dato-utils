import { buildClient } from '@datocms/cma-client';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import * as prettier from 'prettier';
import pluralize from 'pluralize';
// Helper functions
function toCamelCase(str) {
    return str.replace(/([-_][a-z])/gi, ($1) => {
        return $1.toUpperCase().replace('-', '').replace('_', '');
    });
}
function toPascalCase(str) {
    const camel = toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
}
const DATOCMS_API_TOKEN = process.env.DATOCMS_API_TOKEN;
if (!DATOCMS_API_TOKEN) {
    console.error('DATOCMS_API_TOKEN environment variable is not set.');
    process.exit(1);
}
const client = buildClient({ apiToken: DATOCMS_API_TOKEN });
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
		...ResponsiveImageFragment
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
const videoFragmentContent = `fragment VideoFragment on FileField {
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
export default async function generateGqlFiles() {
    try {
        // Create directories if they don't exist
        if (!fs.existsSync(gqlDir)) {
            fs.mkdirSync(gqlDir);
        }
        if (!fs.existsSync(fragmentsDir)) {
            fs.mkdirSync(fragmentsDir);
        }
        fs.writeFileSync(path.join(fragmentsDir, 'ImageFragment.gql'), imageFragmentContent);
        console.log('Created gql/fragments/ImageFragment.gql');
        fs.writeFileSync(path.join(fragmentsDir, 'ImageThumbnailFragment.gql'), imageThumbnailFragmentContent);
        console.log('Created gql/fragments/ImageThumbnailFragment.gql');
        fs.writeFileSync(path.join(fragmentsDir, 'MediaFragment.gql'), mediaFragmentContent);
        console.log('Created gql/fragments/MediaFragment.gql');
        fs.writeFileSync(path.join(fragmentsDir, 'VideoFragment.gql'), videoFragmentContent);
        console.log('Created gql/fragments/VideoFragment.gql');
        fs.writeFileSync(path.join(fragmentsDir, 'SiteFragment.gql'), siteFragmentContent);
        console.log('Created gql/fragments/SiteFragment.gql');
        const models = await client.itemTypes.list();
        // Create a map of model IDs to their API keys and PascalCase names for easy lookup
        const modelMap = new Map();
        models.forEach(m => modelMap.set(m.id, { apiKey: m.api_key, pascalName: toPascalCase(m.api_key) }));
        for (const model of models) {
            // Removed: if (model.modular_block) continue
            const modelApiKey = model.api_key;
            const modelApiKeyPlural = pluralize(modelApiKey);
            const modelNamePascal = toPascalCase(modelApiKey);
            const modelNamePluralPascal = toPascalCase(modelApiKeyPlural);
            const modelApiKeyCamel = toCamelCase(modelApiKey); // Use camelCase for root field keys
            const modelApiKeyPluralCamel = toCamelCase(modelApiKeyPlural);
            let hasAssets = false; // Flag to track if ImageFragment is needed
            let fullFragmentFields = '';
            let lightFragmentFields = '';
            // Fetch fields for the current model
            const fields = await client.fields.list(model.id);
            for (const field of fields) {
                const fieldApiKey = field.api_key;
                const fieldApiKeyCamel = toCamelCase(fieldApiKey);
                const fieldType = field.field_type;
                // Full Fragment Logic
                switch (fieldType) {
                    case 'structured_text': {
                        const blockValidators = field.validators.structured_text_blocks;
                        let blocksQuery = 'blocks';
                        // Use type assertion for the validator
                        if (blockValidators && blockValidators.item_types && blockValidators.item_types.length > 0) {
                            const blockModelIds = blockValidators.item_types;
                            blocksQuery += ` {
`;
                            for (const id of blockModelIds) {
                                const blockModel = models.find(m => m.id === id);
                                if (blockModel) {
                                    const blockFields = await client.fields.list(blockModel.id);
                                    blocksQuery += `      ... on ${toPascalCase(blockModel.api_key)}Record {
`;
                                    for (const blockField of blockFields) {
                                        const blockFieldApiKeyCamel = toCamelCase(blockField.api_key);
                                        const blockFieldType = blockField.field_type;
                                        switch (blockFieldType) {
                                            case 'file':
                                            case 'gallery':
                                                blocksQuery += `        ${blockFieldApiKeyCamel} { ...ImageFragment }\n`;
                                                break;
                                            case 'lat_lon':
                                                blocksQuery += `        ${blockFieldApiKeyCamel} { latitude longitude }\n`;
                                                break;
                                            case 'link':
                                            case 'links': {
                                                const validators = blockField.validators;
                                                const linkValidator = blockFieldType === 'link' ? validators.item_item_type : validators.items_item_type;
                                                if (linkValidator && linkValidator.item_types && linkValidator.item_types.length > 0) {
                                                    const linkedModelIds = linkValidator.item_types;
                                                    let fragmentSpread = '';
                                                    if (linkedModelIds.length === 1) {
                                                        const linkedModelInfo = modelMap.get(linkedModelIds[0]);
                                                        if (linkedModelInfo) {
                                                            fragmentSpread = `{ ...${linkedModelInfo.pascalName}Fragment }`;
                                                        }
                                                        else {
                                                            fragmentSpread = `{ id } # Fallback: Unknown model ${linkedModelIds[0]}`;
                                                        }
                                                    }
                                                    else {
                                                        fragmentSpread = `{
`;
                                                        linkedModelIds.forEach(linkedId => {
                                                            const linkedModelInfo = modelMap.get(linkedId);
                                                            if (linkedModelInfo) {
                                                                fragmentSpread += `          ... on ${linkedModelInfo.pascalName}Record { ...${linkedModelInfo.pascalName}Fragment }\n`;
                                                            }
                                                        });
                                                        fragmentSpread += `        }`;
                                                    }
                                                    blocksQuery += `        ${blockFieldApiKeyCamel} ${fragmentSpread}\n`;
                                                }
                                                else {
                                                    blocksQuery += `        ${blockFieldApiKeyCamel} { id } # Fallback: No specific linked models defined\n`;
                                                }
                                                break;
                                            }
                                            default:
                                                blocksQuery += `        ${blockFieldApiKeyCamel}\n`;
                                        }
                                    }
                                    blocksQuery += `      }\n`;
                                }
                                else {
                                    console.warn(`Warning: Could not find model info for block ID ${id} in structured_text field ${fieldApiKey} of model ${modelApiKey}`);
                                }
                            }
                            blocksQuery += `    }`;
                        }
                        fullFragmentFields += `  ${fieldApiKeyCamel} { value links ${blocksQuery} }\n`;
                        break;
                    }
                    case 'file': // Single Asset
                    case 'gallery': // Multiple Assets
                        fullFragmentFields += `  ${fieldApiKeyCamel} { ...ImageFragment }\n`;
                        hasAssets = true;
                        break;
                    case 'lat_lon': // Coordinates
                        fullFragmentFields += `  ${fieldApiKeyCamel} { latitude longitude }\n`;
                        break;
                    case 'link': // Single Link
                    case 'links': { // Multiple Links
                        const validators = field.validators;
                        const linkValidator = fieldType === 'link' ? validators.item_item_type : validators.items_item_type;
                        // Use type assertion to inform TypeScript about the validator structure
                        if (linkValidator && linkValidator.item_types && linkValidator.item_types.length > 0) {
                            const linkedModelIds = linkValidator.item_types;
                            let fragmentSpread = '';
                            if (linkedModelIds.length === 1) {
                                // Single allowed model type
                                const linkedModelInfo = modelMap.get(linkedModelIds[0]);
                                if (linkedModelInfo) {
                                    fragmentSpread = `{ ...${linkedModelInfo.pascalName}Fragment }`;
                                }
                                else {
                                    console.warn(`Warning: Could not find model info for ID ${linkedModelIds[0]} in field ${fieldApiKey} of model ${modelApiKey}`);
                                    fragmentSpread = `{ id } # Fallback: Unknown model ${linkedModelIds[0]}`;
                                }
                            }
                            else {
                                // Multiple allowed model types - use inline fragments
                                fragmentSpread = `{
`;
                                linkedModelIds.forEach(id => {
                                    const linkedModelInfo = modelMap.get(id);
                                    if (linkedModelInfo) {
                                        fragmentSpread += `    ... on ${linkedModelInfo.pascalName}Record { ...${linkedModelInfo.pascalName}Fragment }\n`;
                                    }
                                    else {
                                        console.warn(`Warning: Could not find model info for ID ${id} in field ${fieldApiKey} of model ${modelApiKey}`);
                                    }
                                });
                                fragmentSpread += `  }`;
                            }
                            fullFragmentFields += `  ${fieldApiKeyCamel} ${fragmentSpread}\n`;
                        }
                        else {
                            // No specific model validation, or unable to determine linked models
                            console.warn(`Warning: Could not determine linked models for field ${fieldApiKey} in model ${modelApiKey}. Falling back to id.`);
                            fullFragmentFields += `  ${fieldApiKeyCamel} { id } # Fallback: No specific linked models defined\n`;
                        }
                        break;
                    }
                    default: // string, text, boolean, integer, float, date, datetime, color, video, json, seo, slug etc.
                        fullFragmentFields += `  ${fieldApiKeyCamel}\n`;
                }
                // Light Fragment Logic
                switch (fieldType) {
                    case 'text':
                        // Exclude large text fields from light fragment
                        break;
                    case 'structured_text': {
                        const blockValidators = field.validators.structured_text_blocks;
                        let blocksQuery = 'blocks';
                        if (blockValidators && blockValidators.item_types && blockValidators.item_types.length > 0) {
                            const blockModelIds = blockValidators.item_types;
                            blocksQuery += ` {
`;
                            for (const id of blockModelIds) {
                                const blockModel = models.find(m => m.id === id);
                                if (blockModel) {
                                    const blockFields = await client.fields.list(blockModel.id);
                                    blocksQuery += `      ... on ${toPascalCase(blockModel.api_key)}Record {
`;
                                    for (const blockField of blockFields) {
                                        const blockFieldApiKeyCamel = toCamelCase(blockField.api_key);
                                        const blockFieldType = blockField.field_type;
                                        switch (blockFieldType) {
                                            case 'file':
                                            case 'gallery':
                                                blocksQuery += `        ${blockFieldApiKeyCamel} { ...ImageFragment }\n`;
                                                break;
                                            case 'lat_lon':
                                                blocksQuery += `        ${blockFieldApiKeyCamel} { latitude longitude }\n`;
                                                break;
                                            case 'link':
                                            case 'links': {
                                                const validators = blockField.validators;
                                                const linkValidator = blockFieldType === 'link' ? validators.item_item_type : validators.items_item_type;
                                                if (linkValidator && linkValidator.item_types && linkValidator.item_types.length > 0) {
                                                    const linkedModelIds = linkValidator.item_types;
                                                    let fragmentSpread = '';
                                                    if (linkedModelIds.length === 1) {
                                                        const linkedModelInfo = modelMap.get(linkedModelIds[0]);
                                                        if (linkedModelInfo) {
                                                            fragmentSpread = `{ ...${linkedModelInfo.pascalName}FragmentLight }`;
                                                        }
                                                        else {
                                                            fragmentSpread = `{ id } # Fallback: Unknown model ${linkedModelIds[0]}`;
                                                        }
                                                    }
                                                    else {
                                                        fragmentSpread = `{
`;
                                                        linkedModelIds.forEach(linkedId => {
                                                            const linkedModelInfo = modelMap.get(linkedId);
                                                            if (linkedModelInfo) {
                                                                fragmentSpread += `          ... on ${linkedModelInfo.pascalName}Record { ...${linkedModelInfo.pascalName}FragmentLight }\n`;
                                                            }
                                                        });
                                                        fragmentSpread += `        }`;
                                                    }
                                                    blocksQuery += `        ${blockFieldApiKeyCamel} ${fragmentSpread}\n`;
                                                }
                                                else {
                                                    blocksQuery += `        ${blockFieldApiKeyCamel} { id } # Fallback: No specific linked models defined\n`;
                                                }
                                                break;
                                            }
                                            default:
                                                blocksQuery += `        ${blockFieldApiKeyCamel}\n`;
                                        }
                                    }
                                    blocksQuery += `      }\n`;
                                }
                                else {
                                    console.warn(`Warning: Could not find model info for block ID ${id} in structured_text field ${fieldApiKey} (light) of model ${modelApiKey}`);
                                }
                            }
                            blocksQuery += `    }`;
                        }
                        lightFragmentFields += `  ${fieldApiKeyCamel} { value links ${blocksQuery} }\n`;
                        break;
                    }
                    case 'file':
                    case 'gallery':
                        lightFragmentFields += `  ${fieldApiKeyCamel} { ...ImageFragment }\n`;
                        hasAssets = true; // Mark if assets are included in light fragment too
                        break;
                    case 'lat_lon': // Coordinates
                        lightFragmentFields += `  ${fieldApiKeyCamel} { latitude longitude }\n`;
                        break;
                    case 'link':
                    case 'links': {
                        // Light fragments for links might just need the ID or a very minimal set
                        // For simplicity, let's mirror the full fragment logic for now,
                        // but ideally, this could be optimized (e.g., only include 'id' or a 'Light' version of the linked fragment)
                        const validators = field.validators;
                        const linkValidator = fieldType === 'link' ? validators.item_item_type : validators.items_item_type;
                        // Use type assertion for the light fragment logic as well
                        if (linkValidator && linkValidator.item_types && linkValidator.item_types.length > 0) {
                            const linkedModelIds = linkValidator.item_types;
                            let fragmentSpread = '';
                            if (linkedModelIds.length === 1) {
                                const linkedModelInfo = modelMap.get(linkedModelIds[0]);
                                if (linkedModelInfo) {
                                    // Consider using a Light fragment if defined, otherwise fallback to full or just id
                                    fragmentSpread = `{ ...${linkedModelInfo.pascalName}FragmentLight }`; // Assuming Light fragment exists
                                }
                                else {
                                    fragmentSpread = `{ id } # Fallback: Unknown model ${linkedModelIds[0]}`;
                                }
                            }
                            else {
                                fragmentSpread = `{`;
                                linkedModelIds.forEach(id => {
                                    const linkedModelInfo = modelMap.get(id);
                                    if (linkedModelInfo) {
                                        // Consider using a Light fragment if defined
                                        fragmentSpread += `    ... on ${linkedModelInfo.pascalName}Record { ...${linkedModelInfo.pascalName}FragmentLight }\n`; // Assuming Light fragment exists
                                    }
                                });
                                fragmentSpread += `  }`;
                            }
                            lightFragmentFields += `  ${fieldApiKeyCamel} ${fragmentSpread}\n`;
                        }
                        else {
                            lightFragmentFields += `  ${fieldApiKeyCamel} { id } # Fallback: No specific linked models defined\n`;
                        }
                        break;
                    }
                    default:
                        lightFragmentFields += `  ${fieldApiKeyCamel}\n`;
                }
            }
            // Define fragments (common for all models)
            const fullFragment = `fragment ${modelNamePascal}Fragment on ${modelNamePascal}Record {
${fullFragmentFields.trimEnd()}
}`;
            const lightFragment = `fragment ${modelNamePascal}FragmentLight on ${modelNamePascal}Record {
${lightFragmentFields.trimEnd()}
}`;
            // Add import statement if assets are used (needed for both regular and block fragments)
            let gqlImports = '';
            if (hasAssets) {
                // Note: Using #import for graphql-codegen compatibility if needed, adjust if using a different tool
                gqlImports = `#import "./fragments/ImageFragment.gql"\n\n`;
            }
            // Ensure fragments are not empty (check moved slightly earlier)
            if (fullFragmentFields.trim() === '') {
                fullFragmentFields = '  id # Placeholder if no fields\n';
            }
            if (lightFragmentFields.trim() === '') {
                lightFragmentFields = '  id # Placeholder if no fields\n';
            }
            // --- Logic specific to modular blocks vs regular models ---
            if (model.modular_block) {
                // For MODULAR BLOCKS: Only generate the fragment file
                // Combine fragments
                const fragmentFileContent = `${gqlImports}${fullFragment}\n\n${lightFragment}\n`;
                // Format the content using Prettier
                const formattedFragmentContent = await prettier.format(fragmentFileContent, { parser: 'graphql' });
                // Write to fragments directory
                const fragmentFilePath = path.join(fragmentsDir, `${modelNamePascal}Fragment.gql`);
                fs.writeFileSync(fragmentFilePath, formattedFragmentContent);
                console.log(`Created fragment file ${fragmentFilePath}`);
                // Skip query generation for modular blocks
                continue;
            }
            else {
                // For REGULAR MODELS: Generate query file including fragments
                const fileName = `${modelApiKey}.gql`; // Keep original filename convention
                const filePath = path.join(gqlDir, fileName);
                // Check if the model has a 'slug' field and is not a singleton
                const hasSlugField = fields.some(field => field.api_key === 'slug');
                const useSlugFilter = !model.has_singleton_item && hasSlugField;
                // Define query parameters and filter conditionally
                const queryParams = useSlugFilter ? '($slug: String)' : '';
                // NOTE: Assuming filter keys (like 'slug') remain snake_case as per DatoCMS API convention
                const queryFilter = useSlugFilter ? '(filter:{slug: {eq: $slug}})' : '';
                // Define the query for a single item
                const singleQuery = `query ${modelNamePascal}${queryParams} {
  ${modelApiKeyCamel}${queryFilter} {
    ... ${modelNamePascal}Fragment
  }
}`;
                // Define the query for all items only if it's not a singleton model
                let allQuery = '';
                if (!model.has_singleton_item) {
                    // Use the collection_appearance name for pluralization, converted to PascalCase
                    // Fallback to simple 's' logic if collection_appearance is missing
                    allQuery = `
query All${modelNamePluralPascal}($first: IntType = 500, $skip: IntType = 0) {
  all${modelNamePluralPascal}(first: $first, skip: $skip) {
    ... ${modelNamePascal}FragmentLight
  }
  _all${modelNamePluralPascal}Meta {
    count
  }
}`;
                }
                // Combine all parts for the regular model query file
                const gqlContent = `${gqlImports}${singleQuery}
${allQuery}

${fullFragment}

${lightFragment}
`;
                // Format the content using Prettier
                const formattedGqlContent = await prettier.format(gqlContent, { parser: 'graphql' });
                fs.writeFileSync(filePath, formattedGqlContent); // Write the formatted content
                console.log(`Created ${filePath}`);
            } // End of regular model specific logic
        }
        console.log('GraphQL files generated successfully!');
    }
    catch (error) {
        console.error('Error generating GraphQL files:', error);
    }
}
//# sourceMappingURL=generate-gql.js.map