import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { validateEventStudentsBody } from '~~/server/utils/events/eventStudentsBody';
import { bffEventStudentsAvailabilityCheck } from '~~/server/utils/events/eventStudentsBff';
import type { EventStudentsAvailabilityResponse } from '~~/server/utils/events/eventsTypes';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const eventId = parseRequiredUuidRouterParam(event, 'eventId', {
        required: 'Brak identyfikatora wydarzenia.',
        invalid: 'Nieprawidłowy identyfikator wydarzenia.',
    });
    const parsed = validateEventStudentsBody(await readBody(event), {
        allowWindow: true,
    });

    if (!parsed.ok) {
        throw createError({ statusCode: 400, message: parsed.message });
    }

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffEventStudentsAvailabilityCheck(
                event,
                upstreamBase,
                eventId,
                parsed.data,
            ),
        mock: async () => {
            await requireManagerFromCookie(event);
            const data: EventStudentsAvailabilityResponse = {
                available: true,
                issues: [],
            };

            return { success: true, data };
        },
    });
});
