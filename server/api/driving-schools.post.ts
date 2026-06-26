import { bffUpstreamDrivingSchoolsCreate } from '~~/server/utils/schools/drivingSchoolsBff';
import { bffMockDrivingSchoolsCreate } from '~~/server/utils/schools/drivingSchoolsMockBff';

function readOptionalTrimmedString(raw: unknown): string | undefined {
    if (typeof raw === 'string') {
        return raw.trim() || undefined;
    }

    if (raw == null) {
        return undefined;
    }

    return String(raw).trim() || undefined;
}

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const name = readOptionalTrimmedString(body?.name);

    if (!name) {
        throw createError({
            statusCode: 400,
            message: 'Pole name jest wymagane',
        });
    }

    const city = readOptionalTrimmedString(body?.city);
    const address = readOptionalTrimmedString(body?.address);
    const upstream = resolveUpstreamBase(event);
    const payload = {
        name,
        ...(city !== undefined ? { city } : {}),
        ...(address !== undefined ? { address } : {}),
    };

    if (upstream) {
        return bffUpstreamDrivingSchoolsCreate(event, upstream, payload);
    }

    await requireManagerFromCookie(event);

    return bffMockDrivingSchoolsCreate(payload);
});
