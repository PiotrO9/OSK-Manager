import {
    mockCoursesGetById,
    mockCoursesListPayload,
    mockCoursesPatchInstructor,
    mockCoursesPushCreate,
    mockInstructorQualifiedForCategory,
} from './mockCoursesList';
import { mockInstructorBelongsToSchool } from './mockInstructorsList';
import type { BffCourseCreateBody } from './parseCourseCreateBody';

function dataSuccess(data: unknown): { success: true; data: unknown } {
    return { success: true, data };
}

export function bffMockCoursesList(schoolId: string): {
    success: true;
    data: unknown;
} {
    return dataSuccess(mockCoursesListPayload(schoolId));
}

export function bffMockCoursesGetById(id: string): {
    success: true;
    data: unknown;
} {
    const course = mockCoursesGetById(id);

    if (!course) {
        throw createError({
            statusCode: 404,
            message: 'Kurs nie istnieje.',
        });
    }

    return dataSuccess({ course });
}

export function bffMockCoursesCreate(body: BffCourseCreateBody): {
    success: true;
    data: unknown;
} {
    const instructorId = body.instructorId;

    if (typeof instructorId === 'string' && instructorId.length > 0) {
        if (!mockInstructorBelongsToSchool(body.schoolId, instructorId)) {
            throw createError({
                statusCode: 400,
                message:
                    'Wybrany instruktor nie jest przypisany do tej szkoĹ‚y jazdy.',
            });
        }

        if (
            !mockInstructorQualifiedForCategory(
                body.schoolId,
                instructorId,
                body.category,
            )
        ) {
            throw createError({
                statusCode: 400,
                message: 'Instructor is not qualified for this course category',
            });
        }
    }

    const created = mockCoursesPushCreate(body.schoolId, {
        name: body.name,
        category: body.category,
        kind: body.kind,
        totalHours: body.totalHours,
        capacity:
            body.kind === 'THEORY_GROUP'
                ? body.capacity !== undefined
                    ? body.capacity
                    : null
                : null,
        theoryStartDate:
            body.kind === 'THEORY_GROUP'
                ? (body.theoryStartDate ?? null)
                : null,
        theoryEndDate:
            body.kind === 'THEORY_GROUP' ? (body.theoryEndDate ?? null) : null,
        instructorId:
            typeof instructorId === 'string' && instructorId.length > 0
                ? instructorId
                : null,
    });

    return dataSuccess(created);
}

export function bffMockCoursesPatch(
    id: string,
    record: Record<string, unknown>,
): { success: true; data: unknown } {
    if (!('instructorId' in record)) {
        return bffMockCoursesGetById(id);
    }

    const patchResult = mockCoursesPatchInstructor(
        id,
        record.instructorId as string | null,
    );

    if (patchResult.outcome === 'course_not_found') {
        throw createError({
            statusCode: 404,
            message: 'Kurs nie istnieje.',
        });
    }

    if (patchResult.outcome === 'instructor_not_in_school') {
        throw createError({
            statusCode: 400,
            message:
                'Wybrany instruktor nie jest przypisany do szkoĹ‚y tego kursu.',
        });
    }

    if (patchResult.outcome === 'instructor_not_qualified') {
        throw createError({
            statusCode: 400,
            message: 'Instructor is not qualified for this course category',
        });
    }

    return dataSuccess({ course: patchResult.course });
}
