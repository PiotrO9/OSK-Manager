import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamDrivingSchoolsDelete } from '~~/server/utils/schools/drivingSchoolsBff';
import { bffMockDrivingSchoolsDelete } from '~~/server/utils/schools/drivingSchoolsMockBff';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id) {
        throw createError({ statusCode: 400, message: 'Brak ID szkoły' });
    }

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamDrivingSchoolsDelete(event, upstreamBase, id),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockDrivingSchoolsDelete(id);
        },
    });
});
