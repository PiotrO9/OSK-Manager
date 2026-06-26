import { bffEventStudentDeleteOne } from '~~/server/utils/events/eventsBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const eventId = parseRequiredUuidRouterParam(event, 'eventId', {
        required: 'Brak identyfikatora wydarzenia.',
        invalid: 'Nieprawidłowy identyfikator wydarzenia.',
    });
    const studentUserId = parseRequiredUuidRouterParam(event, 'studentUserId', {
        required: 'Brak identyfikatora kursanta.',
        invalid: 'Nieprawidłowy identyfikator kursanta.',
    });

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
