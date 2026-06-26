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
        throw createError({ statusCode: 400, message: 'Brak ID szkoĹ‚y' });
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
    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamDrivingSchoolsUpdate(event, upstream, id, payload);
    }

    await requireManagerFromCookie(event);

    return bffMockDrivingSchoolsUpdate(id, payload);
});
