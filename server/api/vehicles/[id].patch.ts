import { parseVehicleWriteFields } from '~~/server/utils/vehicles/parseVehicleRequestBody';
import { parseRequiredRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredRouterParam(
        event,
        'id',
        'Brak identyfikatora pojazdu.',
    );

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
        return bffUpstreamVehiclesUpdate(event, upstream, id, {
            name: fields.name,
            registrationNumber: fields.registrationNumber,
            inspectionDate: fields.inspectionDate,
            insuranceDate: fields.insuranceDate,
            modelYear: fields.modelYear,
            mileageKm: fields.mileageKm,
        });
    }

    await requireManagerFromCookie(event);

    return bffMockVehiclesUpdate(id, {
        name: fields.name,
        registrationNumber: fields.registrationNumber,
        inspectionDate: fields.inspectionDate,
        insuranceDate: fields.insuranceDate,
        modelYear: fields.modelYear,
        mileageKm: fields.mileageKm,
    });
});
