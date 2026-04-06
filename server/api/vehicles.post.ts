export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const schoolId = parseSchoolIdFromBody(body);

    if (!schoolId) {
        throw createError({
            statusCode: 400,
            message:
                'Pole schoolId jest wymagane i musi być poprawnym identyfikatorem UUID.',
        });
    }

    const fields = parseVehicleWriteFields(body);

    if (!fields) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowe dane żądania.',
        });
    }

    if (!fields.name) {
        throw createError({
            statusCode: 400,
            message: 'Pole name jest wymagane.',
        });
    }

    if (!fields.registrationNumber) {
        throw createError({
            statusCode: 400,
            message: 'Pole registrationNumber jest wymagane.',
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamVehiclesCreate(event, upstream, {
            schoolId,
            name: fields.name,
            registrationNumber: fields.registrationNumber,
            inspectionDate: fields.inspectionDate,
            insuranceDate: fields.insuranceDate,
        });
    }

    await requireManagerFromCookie(event);

    if (
        mockVehiclesFindDuplicateRegistration(
            schoolId,
            fields.registrationNumber,
        )
    ) {
        throw createError({
            statusCode: 409,
            message:
                'Pojazd z tym numerem rejestracyjnym jest już zapisany dla tej szkoły.',
        });
    }

    const created = mockVehiclesCreate({
        schoolId,
        name: fields.name,
        registrationNumber: fields.registrationNumber,
        inspectionDate: fields.inspectionDate,
        insuranceDate: fields.insuranceDate,
    });

    return {
        success: true,
        data: mockVehiclesResponseFromRow(created),
    };
});
