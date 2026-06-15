import { mockStudentProcessStatusPayload } from '~~/server/utils/mockStudentsList';
import { bffUpstreamStudentProcessStatus } from '~~/server/utils/studentsBff';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';

function readQueryString(raw: unknown): string {
    if (typeof raw === 'string') {
        return raw.trim();
    }

    if (Array.isArray(raw)) {
        return String(raw[0] ?? '').trim();
    }

    return '';
}

export default defineEventHandler(async (event) => {
    const userIdRaw = getRouterParam(event, 'userId');
    const studentUserId = userIdRaw?.trim() ?? '';

    if (!studentUserId) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora kursanta.',
        });
    }

    if (!isUuid(studentUserId)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator kursanta.',
        });
    }

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

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamStudentProcessStatus(
            event,
            upstream,
            studentUserId,
            schoolId,
        );
    }

    await requireManagerFromCookie(event);

    const status = mockStudentProcessStatusPayload(studentUserId, schoolId);

    if (!status) {
        throw createError({
            statusCode: 404,
            message: 'Student not found',
        });
    }

    return {
        success: true,
        data: status,
    };
});
