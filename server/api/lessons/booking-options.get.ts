import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';
import {
    isUuid,
    readQueryString,
} from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const raw = getQuery(event);
    const schoolId = readQueryString(raw.schoolId);
    const instructorIds = readQueryString(raw.instructorIds);
    const q = readQueryString(raw.q).trim();
    const page = Number(readQueryString(raw.page) || 1);
    const limit = Number(readQueryString(raw.limit) || 20);
    const ids = instructorIds.split(',');

    if (
        !isUuid(schoolId) ||
        ids.length < 1 ||
        ids.length > 50 ||
        ids.some((id) => !isUuid(id)) ||
        q.length > 100 ||
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 50
    ) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowe parametry rezerwacji.',
        });
    }

    return executeBffAdapter(event, {
        upstream: async ({ upstreamBase }) => {
            const { data } = await upstreamRequest(event, upstreamBase, {
                path: '/lessons/booking-options',
                query: { schoolId, instructorIds, q, page, limit },
                fallbackError: 'Nie udało się pobrać kursantów do rezerwacji.',
            });

            return { success: true, data };
        },
        mock: async () => {
            await requireManagerFromCookie(event);

            return {
                success: true,
                data: { items: [], total: 0, page, limit, totalPages: 0 },
            };
        },
    });
});
