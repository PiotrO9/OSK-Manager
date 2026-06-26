import { bffUpstreamDrivingSchoolsSetDefault } from '~~/server/utils/drivingSchoolsBff';
import { bffMockDrivingSchoolsSetDefault } from '~~/server/utils/drivingSchoolsMockBff';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id) {
        throw createError({ statusCode: 400, message: 'Brak ID szkoĹ‚y' });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamDrivingSchoolsSetDefault(event, upstream, id);
    }

    await requireManagerFromCookie(event);

    return bffMockDrivingSchoolsSetDefault(id);
});
