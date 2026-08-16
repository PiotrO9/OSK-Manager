import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamDrivingSchoolsSetDefault } from '~~/server/utils/schools/drivingSchoolsBff';
import { bffMockDrivingSchoolsSetDefault } from '~~/server/utils/schools/drivingSchoolsMockBff';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id) {
        throw createError({ statusCode: 400, message: 'Brak ID szkoły' });
    }

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamDrivingSchoolsSetDefault(event, upstreamBase, id),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockDrivingSchoolsSetDefault(id);
        },
    });
});
