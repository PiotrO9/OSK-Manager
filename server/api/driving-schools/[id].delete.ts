import { bffUpstreamDrivingSchoolsDelete } from '~~/server/utils/schools/drivingSchoolsBff';
import { bffMockDrivingSchoolsDelete } from '~~/server/utils/schools/drivingSchoolsMockBff';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id) {
        throw createError({ statusCode: 400, message: 'Brak ID szkoĹ‚y' });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamDrivingSchoolsDelete(event, upstream, id);
    }

    await requireManagerFromCookie(event);

    return bffMockDrivingSchoolsDelete(id);
});
