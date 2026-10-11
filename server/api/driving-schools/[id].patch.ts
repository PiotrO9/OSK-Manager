import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamDrivingSchoolsUpdate } from '~~/server/utils/schools/drivingSchoolsBff';
import { bffMockDrivingSchoolsUpdate } from '~~/server/utils/schools/drivingSchoolsMockBff';
import { isCourseKind, type CourseKind } from '~~/shared/contracts/courses';

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

    let enabledCourseKinds: CourseKind[] | undefined;
    let offeredCourseTypeIds: string[] | undefined;

    if (body?.enabledCourseKinds !== undefined) {
        if (
            !Array.isArray(body.enabledCourseKinds) ||
            !body.enabledCourseKinds.every(isCourseKind)
        ) {
            throw createError({
                statusCode: 400,
                message: 'Nieprawidłowe rodzaje kursów',
            });
        }

        enabledCourseKinds = [...new Set<CourseKind>(body.enabledCourseKinds)];
    }

    if (body?.offeredCourseTypeIds !== undefined) {
        if (
            !Array.isArray(body.offeredCourseTypeIds) ||
            !body.offeredCourseTypeIds.every(
                (id: unknown) => typeof id === 'string' && id.trim().length > 0,
            )
        ) {
            throw createError({
                statusCode: 400,
                message: 'Nieprawidłowe kategorie kursów',
            });
        }

        offeredCourseTypeIds = [...new Set<string>(body.offeredCourseTypeIds)];
    }

    const payload = {
        name,
        city: readNullableTrimmedString(body?.city),
        address: readNullableTrimmedString(body?.address),
        ...(enabledCourseKinds !== undefined ? { enabledCourseKinds } : {}),
        ...(offeredCourseTypeIds !== undefined ? { offeredCourseTypeIds } : {}),
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
