export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!body.email || !body.password) {
        throw createError({
            statusCode: 400,
            message: 'Email i hasło są wymagane',
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (!upstream) {
        throw createError({
            statusCode: 503,
            message:
                'Backend nie jest skonfigurowany. Ustaw NUXT_API_UPSTREAM lub NUXT_PUBLIC_API_BASE w pliku .env.',
        });
    }

    return bffUpstreamLogin(event, upstream, body);
});
