import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffEventStudentsGet } from '~~/server/utils/events/eventStudentsBff';
import type { EventStudentsReplaceResponse } from '~~/server/utils/events/eventsTypes';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

interface EventStudentsGetResponse {
    success: true;
    data: EventStudentsReplaceResponse;
}

export default defineEventHandler(async (event) => {
    const eventId = parseRequiredUuidRouterParam(event, 'eventId', {
        required: 'Brak identyfikatora wydarzenia.',
        invalid: 'Nieprawidłowy identyfikator wydarzenia.',
    });

    return executeBffAdapter<EventStudentsGetResponse>(event, {
        upstream: ({ upstreamBase }) =>
            bffEventStudentsGet(event, upstreamBase, eventId),
        mock: async () => {
            await requireManagerFromCookie(event);

            return {
                success: true,
                data: {
                    studentUserIds: [] as string[],
                },
            };
        },
    });
});
