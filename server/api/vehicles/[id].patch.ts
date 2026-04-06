export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id || !id.trim()) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora pojazdu.',
        });
    }

    const body = await readBody(event);
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
        return bffUpstreamVehiclesUpdate(event, upstream, id.trim(), {
            name: fields.name,
            registrationNumber: fields.registrationNumber,
            inspectionDate: fields.inspectionDate,
            insuranceDate: fields.insuranceDate,
            modelYear: fields.modelYear,
            mileageKm: fields.mileageKm,
        });
    }

    await requireManagerFromCookie(event);

    const existing = mockVehiclesGetById(id.trim());

    if (!existing) {
        throw createError({
            statusCode: 404,
            message: 'Pojazd nie istnieje.',
        });
    }

    if (
        mockVehiclesFindDuplicateRegistration(
            existing.schoolId,
            fields.registrationNumber,
            id.trim(),
        )
    ) {
        throw createError({
            statusCode: 409,
            message:
                'Pojazd z tym numerem rejestracyjnym jest już zapisany dla tej szkoły.',
        });
    }

    const updated = mockVehiclesUpdate(id.trim(), {
        name: fields.name,
        registrationNumber: fields.registrationNumber,
        inspectionDate: fields.inspectionDate,
        insuranceDate: fields.insuranceDate,
        modelYear: fields.modelYear,
        mileageKm: fields.mileageKm,
    });

    if (!updated) {
        throw createError({
            statusCode: 404,
            message: 'Pojazd nie istnieje.',
        });
    }

    return {
        success: true,
        data: mockVehiclesResponseFromRow(updated),
    };
});
