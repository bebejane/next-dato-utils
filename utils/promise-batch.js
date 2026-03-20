export default async function promiseBatch(fns, limit) {
    if (!fns || !Array.isArray(fns))
        throw new Error('Expected an array of functions');
    if (!fns.length)
        return [];
    if (typeof limit !== 'number')
        throw new Error('Expected limit to be a number');
    if (limit < 1)
        throw new Error('Expected limit to be greater than 1');
    const results = [];
    const batches = [];
    for (let i = 0; i < fns.length; i += limit)
        batches.push(fns.slice(i, i + limit));
    return new Promise(async (resolve, reject) => {
        for (const batch of batches) {
            try {
                const r = await Promise.all(batch.map((fn) => fn()));
                results.push.apply(results, r);
            }
            catch (e) {
                return reject(e);
            }
        }
        resolve(results);
    });
}
//# sourceMappingURL=promise-batch.js.map