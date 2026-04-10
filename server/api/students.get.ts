import { mockCoursesGetById } from '~~/server/utils/mockCoursesList';
import { mockStudentsListPayload } from '~~/server/utils/mockStudentsList';
import { bffUpstreamStudentsList } from '~~/server/utils/studentsBff';

function isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value.trim(),
    );
}

function readQueryString(raw: unknown): string {
    if (typeof raw === 'string') {
        return raw.trim();
    }

    if (Array.isArray(raw)) {
        return String(raw[0] ?? '').trim();
    }

    return '';
}

function parsePositiveInt(raw: unknown, fallback: number): number {
    if (typeof raw === 'number' && Number.isFinite(raw)) {
        return Math.trunc(raw);
    }

    if (typeof raw === 'string') {
        const p = Number.parseInt(raw.trim(), 10);

        if (!Number.isNaN(p)) {
            return p;
        }
    }

    return fallback;
}

export default defineEventHandler(async (event) => {
    const rawQuery = getQuery(event);
    const schoolId = readQueryString(rawQuery.schoolId);

    if (!schoolId) {
        throw createError({
            statusCode: 400,
            message: 'Parametr schoolId jest wymagany.',
        });
    }

    if (!isUuid(schoolId)) {
        throw createError({
            statusCode: 400,
            message:
                'Parametr schoolId musi być poprawnym identyfikatorem UUID.',
        });
    }

    const page = parsePositiveInt(rawQuery.page, 1);

    if (page < 1) {
        throw createError({
            statusCode: 400,
            message: 'Parametr page musi być liczbą całkowitą ≥ 1.',
        });
    }

    const limit = parsePositiveInt(rawQuery.limit, 20);

    if (limit < 1 || limit > 100) {
        throw createError({
            statusCode: 400,
            message: 'Parametr limit musi być w zakresie 1–100.',
        });
    }

    const courseIdRaw = readQueryString(rawQuery.courseId);
    const courseId = courseIdRaw.length > 0 ? courseIdRaw : undefined;

    if (courseId !== undefined && !isUuid(courseId)) {
        throw createError({
            statusCode: 400,
            message:
                'Parametr courseId musi być poprawnym identyfikatorem UUID.',
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamStudentsList(event, upstream, {
            schoolId,
            page,
            limit,
            courseId,
        });
    }

    await requireManagerFromCookie(event);

    if (courseId !== undefined) {
        const course = mockCoursesGetById(courseId);

        if (!course || course.schoolId !== schoolId) {
            throw createError({
                statusCode: 404,
                message: 'Course not found',
            });
        }
    }

    return {
        success: true,
        data: mockStudentsListPayload(schoolId, page, limit, courseId),
    };
});
