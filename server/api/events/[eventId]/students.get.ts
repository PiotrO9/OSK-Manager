import { bffEventStudentsGet } from '~~/server/utils/events/eventsBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const eventId = parseRequiredUuidRouterParam(event, 'eventId', {
        required: 'Brak identyfikatora wydarzenia.',
        invalid: 'Nieprawidłowy identyfikator wydarzenia.',
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffEventStudentsGet(event, upstream, eventId);
    }

    await requireManagerFromCookie(event);

    return {
        success: true,
        data: {
            studentUserIds: [] as string[],
        },
    };
});
