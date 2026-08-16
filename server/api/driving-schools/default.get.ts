import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamDrivingSchoolsDefault } from '~~/server/utils/schools/drivingSchoolsBff';
import { bffMockDrivingSchoolsDefault } from '~~/server/utils/schools/drivingSchoolsMockBff';

export default defineEventHandler(async (event) => {
    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamDrivingSchoolsDefault(event, upstreamBase),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockDrivingSchoolsDefault();
        },
    });
});
