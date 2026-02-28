import { draftMode } from 'next/headers.js';
import type { RequestInit } from 'next/dist/server/web/spec-extension/request.js';
import { print } from 'graphql/language/printer.js';
import type {
	DocumentNode,
	FieldNode,
	OperationDefinitionNode,
	VariableDefinitionNode,
} from 'graphql';

export interface TypedDocumentNode<
	TResult = { [key: string]: any },
	TVariables = { [key: string]: any },
> extends DocumentNode {
	__apiType?: (variables: TVariables) => TResult;
	__resultType?: TResult;
	__variablesType?: TVariables;
}

export type ApiQueryOptions<V = void> = {
	variables?: V;
	tags?: string[];
	includeDrafts?: boolean;
	excludeInvalid?: boolean;
	cacheTags?: boolean;
	revalidate?: number | undefined;
	logs?: boolean;
	all?: boolean;
	apiToken?: string;
	environment?: string;
	contentLink?: string;
	baseEditingUrl?: string;
};

export type DefaultApiQueryOptions = ApiQueryOptions & {
	variables: undefined;
	tags: undefined;
	includeDrafts: boolean;
	excludeInvalid: boolean;
	cacheTags: boolean;
	visualEditingBaseUrl: string | undefined;
	revalidate: number | undefined;
	logs: boolean;
	all: boolean;
	apiToken?: string;
	environment?: string;
	contentLink?: string;
	baseEditingUrl?: string;
};

const defaultOptions: DefaultApiQueryOptions = {
	variables: undefined,
	tags: undefined,
	includeDrafts: false,
	excludeInvalid: true,
	cacheTags: false,
	visualEditingBaseUrl: undefined,
	revalidate: !isNaN(parseInt(process.env.REVALIDATE_TIME))
		? parseInt(process.env.REVALIDATE_TIME)
		: 3600,
	logs: false,
	all: false,
	apiToken: undefined,
	environment:
		process.env.DATOCMS_ENVIRONMENT ?? process.env.NEXT_PUBLIC_DATOCMS_ENVIRONMENT ?? 'main',
};

export default async function apiQuery<TResult = any, TVariables = Record<string, any>>(
	query: TypedDocumentNode<TResult, TVariables>,
	options?: ApiQueryOptions<TVariables>,
): Promise<TResult & { draftUrl: string | null }> {
	const opt = { ...defaultOptions, ...(options ?? {}) };

	if (!process.env.DATOCMS_API_TOKEN && !process.env.NEXT_PUBLIC_DATOCMS_API_TOKEN)
		throw new Error('DATOCMS_API_TOKEN is not set');
	if (!process.env.DATOCMS_ENVIRONMENT && !process.env.NEXT_PUBLIC_DATOCMS_ENVIRONMENT)
		throw new Error('DATOCMS_ENVIRONMENT is not set');

	const queryId = (query.definitions?.[0] as any).name?.value as string;

	if (typeof options?.includeDrafts === 'undefined')
		try {
			opt.includeDrafts = (await draftMode()).isEnabled;
		} catch (e) {}

	const dedupeOptions: DedupeOptions = {
		body: JSON.stringify({ query: print(query), variables: options?.variables }) as string,
		...opt,
		queryId,
	};

	const res = opt.includeDrafts
		? await dedupedFetch({ ...dedupeOptions, url: 'https://graphql-listen.datocms.com/preview' })
		: {};

	opt.logs && console.log('[api-query]', 'calling', queryId);
	const { data } = await dedupedFetch(dedupeOptions);

	if (opt.all) {
		const paginatedData = await paginatedQuery<TResult, TVariables>(query, opt, data, queryId);
		return { ...paginatedData, draftUrl: res.url ?? null };
	}

	return { ...data, draftUrl: res.url ?? null };
}

const paginatedQuery = async <TResult = any, TVariables = Record<string, any>>(
	query: TypedDocumentNode<TResult, TVariables>,
	options: ApiQueryOptions<any>,
	data: any,
	queryId: string,
): Promise<TResult> => {
	try {
		if (typeof data !== 'object' || data === null || data === undefined)
			throw new Error('Data must be an object');

		const operation = query.definitions?.find(
			({ kind }) => kind === 'OperationDefinition',
		) as OperationDefinitionNode;

		if (!operation) throw new Error('Query must have an operation definition');

		const firstVariable = operation.variableDefinitions?.find(
			(v) => v.variable.name.value === 'first',
		) as VariableDefinitionNode;
		const skipVariable = operation.variableDefinitions?.find(
			(v) => v.variable.name.value === 'skip',
		) as VariableDefinitionNode;

		if (!firstVariable || !skipVariable)
			throw new Error(`Query must have first and skip variables`);

		const pageKeys = Object.keys(data).filter((k) => k.startsWith('_all') && k.endsWith('Meta'));

		if (pageKeys.length === 0) throw new Error('Query must have at least one paginated field');

		const pageKeyMap = pageKeys.reduce<{ [key: string]: string }>((acc, cur) => {
			acc[cur] = `${cur.substring(1, cur.length - 'Meta'.length)}`;
			return acc;
		}, {});

		// Check filter diff
		Object.keys(pageKeyMap).forEach((k) => {
			const filter = (
				operation.selectionSet.selections.find(
					(s) => (s as FieldNode).name.value === k,
				) as FieldNode
			)?.arguments?.find((a) => a.name.value === 'filter');
			const metaFilter = (
				operation.selectionSet.selections.find(
					(s) => (s as FieldNode).name.value === pageKeyMap[k],
				) as FieldNode
			)?.arguments?.find((a) => a.name.value === 'filter');
			if (
				(!filter && metaFilter) ||
				(filter && !metaFilter) ||
				JSON.stringify(filter) !== JSON.stringify(metaFilter)
			)
				throw new Error(`Query must have same filter argument on ${k} and ${pageKeyMap[k]}`);
		});

		const first = options.variables?.first ?? (firstVariable?.defaultValue as any)?.value ?? 500;

		if (first > 500) throw new Error('"first" variable must be less than or equal to 500');

		let count = 0;

		while (Object.keys(pageKeyMap).some((k) => data[k].count > data[pageKeyMap[k]].length)) {
			const maxPageKey =
				pageKeyMap[
					Object.keys(pageKeyMap).sort((a, b) => (data[a].count > data[b].count ? -1 : 1))[0]
				];
			const skip = data[maxPageKey].length;

			const pageData: any = await apiQuery(query, {
				...options,
				all: false,
				variables: {
					...options.variables,
					first,
					skip,
				},
			});

			Object.keys(pageKeyMap).forEach(
				(k) => (data[pageKeyMap[k]] = [...data[pageKeyMap[k]], ...pageData[pageKeyMap[k]]]),
			);

			if (++count > 1000) {
				throw new Error('Paginated query exceeded 1000 requests');
			}
		}

		return data;
	} catch (e) {
		throw new Error(`${queryId}: ${(e as Error).message}`);
	}
};

export type DedupeOptions = {
	url?: string;
	body: string;
	includeDrafts: boolean;
	excludeInvalid: boolean;
	cacheTags: boolean;
	visualEditingBaseUrl: string | undefined;
	revalidate?: number;
	tags?: string[] | undefined;
	queryId: string;
	logs: boolean;
	apiToken?: string;
	environment?: string;
};

const dedupedFetch = async (options: DedupeOptions) => {
	const {
		url,
		body,
		includeDrafts,
		excludeInvalid,
		cacheTags,
		revalidate,
		queryId,
		logs,
		apiToken,
		environment,
	} = options;

	const apiKey =
		apiToken || process.env.DATOCMS_API_TOKEN || process.env.NEXT_PUBLIC_DATOCMS_API_TOKEN;
	const baseEditingUrl = process.env.NEXT_PUBLIC_DATOCMS_BASE_EDITING_URL;
	const visualEditing = baseEditingUrl ? 'vercel-v1' : undefined;

	const headers = {
		'Authorization': `Bearer ${apiKey}`,
		'X-Environment': environment,
		...(excludeInvalid ? { 'X-Exclude-Invalid': 'true' } : {}),
		...(cacheTags ? { 'X-Cache-Tags': 'true' } : {}),
		...(includeDrafts ? { 'X-Include-Drafts': 'true' } : {}),
		...(includeDrafts && visualEditing ? { 'X-Visual-Editing': 'vercel-v1' } : {}),
		...(baseEditingUrl ? { 'X-Base-Editing-Url': baseEditingUrl } : {}),
	} as unknown as HeadersInit;

	const response = await fetch(url ?? 'https://graphql.datocms.com/', {
		method: 'POST',
		headers,
		body,
		next: {
			revalidate,
			tags: options.tags,
		},
	} as RequestInit);

	const responseBody = await response.json();

	if (!response.ok)
		throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(responseBody)}`);
	if (responseBody.errors)
		throw new Error(`${queryId}: ${responseBody.errors.map((e: any) => e.message).join('. ')}`);

	logs &&
		console.log(
			'[api-query]',
			queryId,
			{ ...options, body: undefined },
			response.headers.get('x-cache'),
		);

	const _cacheTags = response.headers.get('X-Cache-Tags')
		? response.headers.get('X-Cache-Tags')?.split(' ')
		: [];
	return { ...responseBody, _cacheTags };
};
