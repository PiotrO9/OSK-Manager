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
            modelYear: fields.modelYear,
            mileageKm: fields.mileageKm,
        });
    }

    await requireManagerFromCookie(event);

    return bffMockVehiclesCreate({
        schoolId,
        name: fields.name,
        registrationNumber: fields.registrationNumber,
        inspectionDate: fields.inspectionDate,
        insuranceDate: fields.insuranceDate,
        modelYear: fields.modelYear,
        mileageKm: fields.mileageKm,
    });
});
