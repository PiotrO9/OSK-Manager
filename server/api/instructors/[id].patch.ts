import { bffUpstreamInstructorsPatch } from '~~/server/utils/instructorsBff';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';
import { mockInstructorsPatchById } from '~~/server/utils/mockInstructorsList';

const ALLOWED_PATCH_KEYS = [
    'firstName',
    'lastName',
    'experienceYears',
    'qualifications',
    'qualifiedCourseTypeIds',
] as const;

function stripInstructorPatchBody(raw: unknown): Record<string, unknown> {
    if (!raw || typeof raw !== 'object') {
        return {};
    }

    const o = raw as Record<string, unknown>;
    const out: Record<string, unknown> = {};

    for (const key of ALLOWED_PATCH_KEYS) {
        if (!(key in o) || o[key] === undefined) {
            continue;
        }

        if (key === 'experienceYears') {
            const v = o[key];

            if (typeof v === 'number' && Number.isInteger(v)) {
                out[key] = v;
            }

            continue;
        }

        if (key === 'qualifications') {
            out[key] = o[key] == null ? '' : String(o[key]);

            continue;
        }

        if (key === 'qualifiedCourseTypeIds') {
            const v = o[key];

            if (!Array.isArray(v)) {
                throw createError({
                    statusCode: 400,
                    message: 'Invalid qualifiedCourseTypeIds',
                });
            }

            const ids: string[] = [];

            for (const item of v) {
                const id = typeof item === 'string' ? item.trim() : '';

                if (!id || !isUuid(id)) {
                    throw createError({
                        statusCode: 400,
                        message: 'Invalid qualifiedCourseTypeIds',
                    });
                }

                if (!ids.includes(id)) {
                    ids.push(id);
                }
            }

            out[key] = ids;

            continue;
        }

        if (key === 'firstName' || key === 'lastName') {
            out[key] = o[key] == null ? '' : String(o[key]);
        }
    }

    return out;
}

export default defineEventHandler(async (event) => {
    const idRaw = getRouterParam(event, 'id');
    const id = idRaw?.trim() ?? '';

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora instruktora.',
        });
    }

    if (!isUuid(id)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator instruktora.',
        });
    }

    const rawBody = await readBody(event);
    const patch = stripInstructorPatchBody(rawBody);

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamInstructorsPatch(event, upstream, id, patch);
    }

    await requireManagerFromCookie(event);

    const updated = mockInstructorsPatchById(id, patch);

    if (!updated) {
        throw createError({
            statusCode: 404,
            message: 'Instruktor nie istnieje.',
        });
    }

    return {
        success: true,
        data: updated,
    };
});
