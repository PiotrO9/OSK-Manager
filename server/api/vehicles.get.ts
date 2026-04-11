function isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value.trim(),
    );
}

function readOptionalQueryString(raw: unknown): string {
    if (typeof raw === 'string') {
        return raw.trim();
    }

    if (Array.isArray(raw)) {
        return String(raw[0] ?? '').trim();
    }

    return '';
}

export default defineEventHandler(async (event) => {
    const rawQuery = getQuery(event);
    const schoolIdRaw = rawQuery.schoolId;
    const schoolId =
        typeof schoolIdRaw === 'string'
            ? schoolIdRaw.trim()
            : Array.isArray(schoolIdRaw)
              ? String(schoolIdRaw[0] ?? '').trim()
              : '';

    if (!schoolId) {
        throw createError({
            statusCode: 400,
            message: 'Parametr schoolId jest wymagany.',
        });
    }

    if (!isUuid(schoolId)) {
        throw createError({
            statusCode: 400,
            message:
                'Parametr schoolId musi być poprawnym identyfikatorem UUID.',
        });
    }

    const startTime = readOptionalQueryString(rawQuery.startTime);
    const endTime = readOptionalQueryString(rawQuery.endTime);

    if (startTime.length > 0 !== endTime.length > 0) {
        throw createError({
            statusCode: 400,
            message:
                'Parametry startTime i endTime muszą być podane razem lub wcale.',
        });
    }

    const timeFilter =
        startTime.length > 0 && endTime.length > 0
            ? { startTime, endTime }
            : undefined;

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamVehiclesList(event, upstream, schoolId, timeFilter);
    }

    await requireAuthenticatedFromCookie(event);

    return {
        success: true,
        data: mockVehiclesListForSchool(schoolId),
    };
});
