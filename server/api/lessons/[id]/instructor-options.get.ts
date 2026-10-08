import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';
import {
    parseRequiredUuidRouterParam,
    readQueryString,
    isUuid,
} from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora jazdy.',
        invalid: 'Nieprawidłowy identyfikator jazdy.',
    });
    const raw = getQuery(event);
    const date = readQueryString(raw.date);
    const startTime = readQueryString(raw.startTime);
    const endTime = readQueryString(raw.endTime);
    const vehicleId = readQueryString(raw.vehicleId);

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime) ||
        startTime >= endTime ||
        !isUuid(vehicleId)
    ) {
        throw createError({
            statusCode: 400,
            message: 'Podaj poprawny termin i pojazd.',
        });
    }

    return executeBffAdapter(event, {
        upstream: async ({ upstreamBase }) => {
            const { data } = await upstreamRequest(event, upstreamBase, {
                path: `/lessons/${encodeURIComponent(id)}/instructor-options`,
                query: { date, startTime, endTime, vehicleId },
                fallbackError: 'Nie udało się pobrać dostępnych instruktorów.',
            });

            return { success: true, data };
        },
        mock: async () => {
            await requireManagerFromCookie(event);

            return { success: true, data: { instructors: [] } };
        },
    });
});
