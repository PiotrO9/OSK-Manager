import {
    parseRequiredUuidQuery,
    parseRequiredUuidRouterParam,
} from '~~/server/utils/requestValidation';
import { bffUpstreamStudentDetail } from '~~/server/utils/studentsBff';

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
        return bffUpstreamStudentDetail(
            event,
            upstream,
            studentUserId,
            schoolId,
        );
    }

    await requireManagerFromCookie(event);

    return bffMockStudentDetail(studentUserId, schoolId);
});
