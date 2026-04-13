import { bffEventStudentDeleteOne } from '~~/server/utils/eventsBff';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';

export default defineEventHandler(async (event) => {
    const eventIdRaw = getRouterParam(event, 'eventId');
    const eventId = eventIdRaw?.trim() ?? '';
    const studentRaw = getRouterParam(event, 'studentUserId');
    const studentUserId = studentRaw?.trim() ?? '';

    if (!eventId) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora wydarzenia.',
        });
    }

    if (!isUuid(eventId)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator wydarzenia.',
        });
    }

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

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffEventStudentDeleteOne(
            event,
            upstream,
            eventId,
            studentUserId,
        );
    }

    await requireManagerFromCookie(event);

    return {
        success: true,
        data: {
            studentUserIds: [] as string[],
        },
    };
});
