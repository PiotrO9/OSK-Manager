import { bffUpstreamDrivingSchoolsDefault } from '~~/server/utils/drivingSchoolsBff';
import { bffMockDrivingSchoolsDefault } from '~~/server/utils/drivingSchoolsMockBff';

export default defineEventHandler(async (event) => {
    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamDrivingSchoolsDefault(event, upstream);
    }

    await requireManagerFromCookie(event);

    return bffMockDrivingSchoolsDefault();
});
