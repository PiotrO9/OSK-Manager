export default defineEventHandler(async (event) => {
    const schoolIdParam = getRouterParam(event, 'id');

    if (!schoolIdParam || !schoolIdParam.trim()) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora szkoły jazdy.',
        });
    }

    const schoolId = schoolIdParam.trim();
    const body = await readBody(event);

    const vehicleIdRaw =
        body &&
        typeof body === 'object' &&
        'vehicleId' in body &&
        body.vehicleId != null
            ? String(body.vehicleId).trim()
            : '';

    if (!vehicleIdRaw) {
        throw createError({
            statusCode: 400,
            message: 'Pole vehicleId jest wymagane.',
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamDrivingSchoolsSetDefaultVehicle(
            event,
            upstream,
            schoolId,
            vehicleIdRaw,
        );
    }

    await requireManagerFromCookie(event);

    const ok = mockVehiclesSetDefaultForSchool(schoolId, vehicleIdRaw);

    if (!ok) {
        throw createError({
            statusCode: 404,
            message:
                'Szkoła lub pojazd nie istnieje, albo pojazd nie należy do tej szkoły.',
        });
    }

    const row = mockVehiclesGetById(vehicleIdRaw);

    return {
        success: true,
        data: row ? mockVehiclesResponseFromRow(row) : null,
    };
});
