import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';

export default defineEventHandler(async (event) => {
    const body = await readBody<{ email?: string }>(event);

    if (!body?.email || typeof body.email !== 'string') {
        throw createError({ statusCode: 400, message: 'Podaj adres e-mail.' });
    }

    return executeBffAdapter(event, {
        upstream: async ({ upstreamBase }) => {
            const { data } = await upstreamRequest(event, upstreamBase, {
                path: '/auth/password-recovery/request',
                method: 'POST',
                auth: false,
                body: { email: body.email },
                fallbackError: 'Nie udało się wysłać linku resetu.',
                clearCookiesOnUnauthorized: 'none',
            });

            return { success: true, data };
        },
        mock: () => {
            throw createError({
                statusCode: 503,
                message: 'Backend nie jest skonfigurowany.',
            });
        },
    });
});
