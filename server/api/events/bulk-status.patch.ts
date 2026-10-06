import { z } from 'zod';
import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { requireInstructorFromCookie } from '~~/server/utils/auth/requireInstructorFromCookie';
import { eventDataRequest } from '~~/server/utils/events/eventsRequest';

const bodySchema = z.object({
    eventIds: z.array(z.string().uuid()).min(1).max(100),
    status: z.enum(['PLANNED', 'DONE', 'NO_SHOW', 'CANCELLED']),
});

export default defineEventHandler(async (event) => {
    const parsed = bodySchema.safeParse(await readBody(event));

    if (!parsed.success) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowe dane statusu wydarzenia.',
        });
    }

    return executeBffAdapter(event, {
        upstream: async ({ upstreamBase }) => {
            const data = await eventDataRequest<{
                updated: number;
                skipped: number;
            }>(event, upstreamBase, {
                path: '/events/bulk-status',
                method: 'PATCH',
                body: parsed.data,
                fallbackError: 'Nie udało się zmienić statusu wydarzenia.',
            });

            if (
                !data ||
                typeof data.updated !== 'number' ||
                typeof data.skipped !== 'number'
            ) {
                throw createError({
                    statusCode: 502,
                    message: 'Nieprawidłowa odpowiedź serwera.',
                });
            }

            return { success: true, data };
        },
        mock: async () => {
            await requireInstructorFromCookie(event);

            return {
                success: true,
                data: { updated: parsed.data.eventIds.length, skipped: 0 },
            };
        },
    });
});
