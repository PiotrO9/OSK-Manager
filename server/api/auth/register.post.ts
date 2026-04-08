export default defineEventHandler(async (event) => {
    const upstream = resolveUpstreamBase(event);

    if (!upstream) {
        throw createError({
            statusCode: 503,
            message:
                'Backend nie jest skonfigurowany. Ustaw NUXT_API_UPSTREAM lub NUXT_PUBLIC_API_BASE w pliku .env.',
        });
    }

    const body = await readBody(event);

    if (!body || typeof body !== 'object') {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowe dane żądania.',
        });
    }

    const record = body as { role?: unknown };

    if (record.role !== 'INSTRUCTOR') {
        throw createError({
            statusCode: 400,
            message:
                'Ten endpoint obsługuje wyłącznie rejestrację instruktora (role: INSTRUCTOR).',
        });
    }

    return bffUpstreamRegister(event, upstream, body);
});
