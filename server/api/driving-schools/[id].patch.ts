import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamDrivingSchoolsUpdate } from '~~/server/utils/schools/drivingSchoolsBff';
import { bffMockDrivingSchoolsUpdate } from '~~/server/utils/schools/drivingSchoolsMockBff';

function readNullableTrimmedString(raw: unknown): string | null {
    if (typeof raw === 'string') {
        return raw.trim() || null;
    }

    if (raw == null) {
        return null;
    }

    return String(raw).trim() || null;
}

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id) {
        throw createError({ statusCode: 400, message: 'Brak ID szkoły' });
    }

    const body = await readBody(event);
    const name = readNullableTrimmedString(body?.name);

    if (!name) {
        throw createError({
            statusCode: 400,
            message: 'Pole name jest wymagane',
        });
    }

    const payload = {
        name,
        city: readNullableTrimmedString(body?.city),
        address: readNullableTrimmedString(body?.address),
    };

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamDrivingSchoolsUpdate(event, upstreamBase, id, payload),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockDrivingSchoolsUpdate(id, payload);
        },
    });
});
