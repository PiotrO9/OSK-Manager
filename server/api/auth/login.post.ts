import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!body.email || !body.password) {
        throw createError({
            statusCode: 400,
            message: 'Email i hasło są wymagane',
        });
    }

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamLogin(event, upstreamBase, body),
        mock: () => {
            throw createError({
                statusCode: 503,
                message:
                    'Backend nie jest skonfigurowany. Ustaw NUXT_API_UPSTREAM lub NUXT_PUBLIC_API_BASE w pliku .env.',
            });
        },
    });
});
