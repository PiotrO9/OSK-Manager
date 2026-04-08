import { bffUpstreamCoursesCreate } from '~~/server/utils/coursesBff';
import { mockInstructorBelongsToSchool } from '~~/server/utils/mockInstructorsList';
import { mockCoursesPushCreate } from '~~/server/utils/mockCoursesList';
import {
    courseCreateBodyToUpstreamRecord,
    parseCourseCreateBody,
} from '~~/server/utils/parseCourseCreateBody';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const parsed = parseCourseCreateBody(body);

    if ('error' in parsed) {
        throw createError({
            statusCode: 400,
            message: parsed.error,
        });
    }

    const { bffBody } = parsed;
    const schoolId = bffBody.schoolId;

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        const payload = courseCreateBodyToUpstreamRecord(bffBody);

        return bffUpstreamCoursesCreate(event, upstream, payload);
    }

    await requireManagerFromCookie(event);

    const iid = bffBody.instructorId;

    if (typeof iid === 'string' && iid.length > 0) {
        if (!mockInstructorBelongsToSchool(schoolId, iid)) {
            throw createError({
                statusCode: 400,
                message:
                    'Wybrany instruktor nie jest przypisany do tej szkoły jazdy.',
            });
        }
    }

    const capacityForMock =
        bffBody.kind === 'THEORY_GROUP'
            ? bffBody.capacity !== undefined
                ? bffBody.capacity
                : null
            : null;

    const theoryStart =
        bffBody.kind === 'THEORY_GROUP'
            ? (bffBody.theoryStartDate ?? null)
            : null;
    const theoryEnd =
        bffBody.kind === 'THEORY_GROUP'
            ? (bffBody.theoryEndDate ?? null)
            : null;

    const created = mockCoursesPushCreate(schoolId, {
        name: bffBody.name,
        category: bffBody.category,
        kind: bffBody.kind,
        totalHours: bffBody.totalHours,
        capacity: capacityForMock,
        theoryStartDate: theoryStart,
        theoryEndDate: theoryEnd,
        instructorId: typeof iid === 'string' && iid.length > 0 ? iid : null,
    });

    return {
        success: true,
        data: created,
    };
});
