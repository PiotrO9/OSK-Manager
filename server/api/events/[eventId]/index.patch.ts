import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffEventsPatch } from '~~/server/utils/events/eventsCrudBff';
import type { InstructorEventResponse } from '~~/server/utils/events/eventsTypes';
import { parseEventPatchBody } from '~~/server/utils/events/parseEventPatchBody';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

interface EventPatchResponse {
    success: true;
    data: { event: InstructorEventResponse };
}

export default defineEventHandler(async (event) => {
    const eventId = parseRequiredUuidRouterParam(event, 'eventId', {
        required: 'Brak identyfikatora wydarzenia.',
        invalid: 'Nieprawidłowy identyfikator wydarzenia.',
    });

    const rawBody = await readBody(event);
    const parsed = parseEventPatchBody(rawBody);

    if (!parsed.ok) {
        throw createError({
            statusCode: 400,
            message: parsed.message,
        });
    }

    return executeBffAdapter<EventPatchResponse>(event, {
        upstream: ({ upstreamBase }) =>
            bffEventsPatch(event, upstreamBase, eventId, parsed.body),
        mock: async () => {
            await requireManagerFromCookie(event);

            const now = new Date().toISOString();
            const b = parsed.body;
            const type = b.type ?? 'THEORY';

            let vehicleId: string | null = null;

            if (type === 'DRIVE') {
                vehicleId =
                    b.vehicleId !== undefined
                        ? b.vehicleId
                        : '00000000-0000-4000-8000-000000000002';
            }

            return {
                success: true,
                data: {
                    event: {
                        id: eventId,
                        instructorId:
                            b.instructorId ??
                            '00000000-0000-4000-8000-000000000001',
                        type,
                        startTime: b.startTime ?? now,
                        endTime: b.endTime ?? now,
                        vehicleId,
                        capacity: b.capacity !== undefined ? b.capacity : null,
                        status: b.status ?? 'PLANNED',
                        createdAt: now,
                    },
                },
            };
        },
    });
});
