import { mockStudentProcessStatusPayload } from '~~/server/utils/mockStudentsList';
import {
    parseRequiredUuidQuery,
    parseRequiredUuidRouterParam,
} from '~~/server/utils/requestValidation';
import { bffUpstreamStudentProcessStatus } from '~~/server/utils/studentsBff';

export default defineEventHandler(async (event) => {
    const studentUserId = parseRequiredUuidRouterParam(event, 'userId', {
        required: 'Brak identyfikatora kursanta.',
        invalid: 'Nieprawidłowy identyfikator kursanta.',
    });

    const rawQuery = getQuery(event);
    const schoolId = parseRequiredUuidQuery(rawQuery, 'schoolId', {
        required: 'Parametr schoolId jest wymagany.',
        invalid: 'Parametr schoolId musi być poprawnym identyfikatorem UUID.',
    });

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
