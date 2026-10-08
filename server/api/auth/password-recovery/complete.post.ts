import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';

export default defineEventHandler(async (event) => {
    const body = await readBody<{
        accessToken?: string;
        refreshToken?: string;
        password?: string;
    }>(event);

    if (!body?.accessToken || !body.refreshToken || !body.password) {
        throw createError({
            statusCode: 400,
            message: 'Brak danych do zmiany hasła.',
        });
    }

    return executeBffAdapter(event, {
        upstream: async ({ upstreamBase }) => {
            const { data } = await upstreamRequest(event, upstreamBase, {
                path: '/auth/password-recovery/complete',
                method: 'POST',
                auth: false,
                body,
                fallbackError: 'Nie udało się zmienić hasła.',
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
