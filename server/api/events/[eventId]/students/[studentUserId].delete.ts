import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffEventStudentDeleteOne } from '~~/server/utils/events/eventStudentsBff';
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

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffEventStudentDeleteOne(
                event,
                upstreamBase,
                eventId,
                studentUserId,
            ),
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
