function isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value.trim(),
    );
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

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamInstructorsList(event, upstream, schoolId);
    }

    await requireManagerFromCookie(event);

    return {
        success: true,
        data: mockInstructorsListPayload(schoolId),
    };
});
