export const handler = (...middleware) => async (request) => {
    let result;
    for (let i = 0; i < middleware.length; i++) {
        let nextInvoked = false;
        const next = async () => {
            nextInvoked = true;
        };
        result = await middleware[i](request, next);
        if (!nextInvoked) {
            break;
        }
    }
    if (result)
        return result;
    throw new Error('Your handler or middleware must return a NextResponse!');
};
export default handler;
//# sourceMappingURL=middleware.js.map