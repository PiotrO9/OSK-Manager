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
    const role = record.role;

    if (role !== 'INSTRUCTOR' && role !== 'STUDENT') {
        throw createError({
            statusCode: 400,
            message:
                'Dozwolone role: INSTRUCTOR (instruktor) lub STUDENT (kursant).',
        });
    }

    return bffUpstreamRegister(event, upstream, body);
});
