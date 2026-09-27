import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import {
    bffExceptionsGet,
    type ExceptionEntryResponse,
} from '~~/server/utils/instructors/availabilityBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora instruktora.',
        invalid: 'Nieprawidłowy identyfikator instruktora.',
    });
    const query = getQuery(event);
    const from = typeof query.from === 'string' ? query.from : '';
    const to = typeof query.to === 'string' ? query.to : '';

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(from) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(to) ||
        from > to
    ) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Nieprawidłowy zakres dat.',
        });
    }

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffExceptionsGet(event, upstreamBase, id, from, to),
        mock: async () => {
            await requireManagerFromCookie(event);

            return {
                success: true,
                data: { exceptions: [] as ExceptionEntryResponse[] },
            };
        },
    });
});
