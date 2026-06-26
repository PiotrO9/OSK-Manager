import { bffUpstreamDrivingSchoolsSetDefaultVehicle } from '~~/server/utils/schools/drivingSchoolsBff';
import { bffMockDrivingSchoolsSetDefaultVehicle } from '~~/server/utils/schools/drivingSchoolsMockBff';

export default defineEventHandler(async (event) => {
    const schoolId = getRouterParam(event, 'id')?.trim() ?? '';

    if (!schoolId) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora szkoły jazdy.',
        });
    }

    const body = await readBody(event);
    const vehicleId =
        body &&
        typeof body === 'object' &&
        'vehicleId' in body &&
        body.vehicleId != null
            ? String(body.vehicleId).trim()
            : '';

    if (!vehicleId) {
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
            vehicleId,
        );
    }

    await requireManagerFromCookie(event);

    return bffMockDrivingSchoolsSetDefaultVehicle(schoolId, vehicleId);
});
