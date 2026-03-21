export async function getRoute(record, locale, config) {
    const key = record._modelApiKey;
    const routes = await config.routes[key]?.(record, locale, true);
    return routes?.[0] ?? null;
}
//# sourceMappingURL=config.js.map