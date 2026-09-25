import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffEventStudentsPut } from '~~/server/utils/events/eventStudentsBff';
import { validateEventStudentsBody } from '~~/server/utils/events/eventStudentsBody';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const eventId = parseRequiredUuidRouterParam(event, 'eventId', {
        required: 'Brak identyfikatora wydarzenia.',
        invalid: 'Nieprawidłowy identyfikator wydarzenia.',
    });

    const rawBody = await readBody(event);
    const parsed = validateEventStudentsBody(rawBody);

    if (!parsed.ok) {
        throw createError({
            statusCode: 400,
            message: parsed.message,
        });
    }

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffEventStudentsPut(event, upstreamBase, eventId, {
                studentIds: parsed.data.studentIds,
            }),
        mock: async () => {
            await requireManagerFromCookie(event);

            const sorted = [...parsed.data.studentIds].sort();

            return {
                success: true,
                data: {
                    studentUserIds: sorted,
                },
            };
        },
    });
});
