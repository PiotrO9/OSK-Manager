import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';

export default defineEventHandler(async (event) => {
    return executeBffAdapter(event, {
        upstream: async ({ upstreamBase }) => {
            const body = await readBody(event);

            if (!body || typeof body !== 'object') {
                throw createError({
                    statusCode: 400,
                    message: 'Nieprawidłowe dane żądania.',
                });
            }

            const record = body as { role?: unknown };
            const role = record.role;

            if (role !== 'INSTRUCTOR' && role !== 'STUDENT') {
                throw createError({
                    statusCode: 400,
                    message:
                        'Dozwolone role: INSTRUCTOR (instruktor) lub STUDENT (kursant).',
                });
            }

            return bffUpstreamRegister(event, upstreamBase, body);
        },
        mock: () => {
            throw createError({
                statusCode: 503,
                message:
                    'Backend nie jest skonfigurowany. Ustaw NUXT_API_UPSTREAM lub NUXT_PUBLIC_API_BASE w pliku .env.',
            });
        },
    });
});
