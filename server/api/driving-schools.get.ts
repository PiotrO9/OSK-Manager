import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamDrivingSchoolsList } from '~~/server/utils/schools/drivingSchoolsBff';
import { bffMockDrivingSchoolsList } from '~~/server/utils/schools/drivingSchoolsMockBff';

export default defineEventHandler(async (event) => {
    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamDrivingSchoolsList(event, upstreamBase),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockDrivingSchoolsList();
        },
    });
});
