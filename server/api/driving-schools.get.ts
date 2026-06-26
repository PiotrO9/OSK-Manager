import { bffUpstreamDrivingSchoolsList } from '~~/server/utils/schools/drivingSchoolsBff';
import { bffMockDrivingSchoolsList } from '~~/server/utils/schools/drivingSchoolsMockBff';

export default defineEventHandler(async (event) => {
    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamDrivingSchoolsList(event, upstream);
    }

    await requireManagerFromCookie(event);

    return bffMockDrivingSchoolsList();
});
