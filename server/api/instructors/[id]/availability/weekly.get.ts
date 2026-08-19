import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffWeeklyGet } from '~~/server/utils/instructors/availabilityBff';
import { mockAvailabilityGetWeekly } from '~~/server/utils/instructors/mockAvailabilityStore';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora instruktora.',
        invalid: 'Nieprawidłowy identyfikator instruktora.',
    });

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) => bffWeeklyGet(event, upstreamBase, id),
        mock: async () => {
            await requireManagerFromCookie(event);

            return {
                success: true,
                data: {
                    weekly: mockAvailabilityGetWeekly(id),
                },
            };
        },
    });
});
