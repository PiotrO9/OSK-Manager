import { jwtVerify } from 'jose';
import type { H3Event } from 'h3';
import { bffUpstreamStudentEvents } from '~~/server/utils/studentsBff';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';
import { parseScheduleMeQuery } from '~~/server/utils/scheduleQueryValidation';

const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
);

function readStudentEventsQueryString(query: Record<string, unknown>): string {
    const q = query;
    const hasFrom = typeof q.dateFrom === 'string' && q.dateFrom.trim() !== '';
    const hasTo = typeof q.dateTo === 'string' && q.dateTo.trim() !== '';

    if (!hasFrom && !hasTo) {
        return '';
    }

    const parsed = parseScheduleMeQuery(q);

    return new URLSearchParams({
        dateFrom: parsed.dateFrom,
        dateTo: parsed.dateTo,
    }).toString();
}

/**
 * W trybie bez upstreamu: tylko STUDENT i tylko własny userId (ochrona przed odczytem cudzych danych w demo).
 */
async function assertMockStudentOwnsEventsRoute(
    event: H3Event,
    routeUserId: string,
): Promise<void> {
    const accessToken = getCookie(event, 'access_token');

    if (!accessToken) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    try {
        const { payload } = await jwtVerify(accessToken, SECRET);
        const role = String(payload.role ?? '')
            .trim()
            .toUpperCase();
        const uid = String(payload.userId ?? '').trim();

        if (!uid) {
            throw createError({
                statusCode: 401,
                message: 'Nieprawidłowy token',
            });
        }

        if (role !== 'STUDENT') {
            throw createError({
                statusCode: 403,
                message: 'Ta operacja jest dostępna tylko dla kursanta.',
            });
        }

        if (uid !== routeUserId) {
            throw createError({
                statusCode: 403,
                message: 'Brak uprawnień do tych danych.',
            });
        }
    } catch (err: unknown) {
        if (
            err &&
            typeof err === 'object' &&
            'statusCode' in err &&
            typeof (err as { statusCode: unknown }).statusCode === 'number'
        ) {
            throw err;
        }

        throw createError({
            statusCode: 401,
            message: 'Nieprawidłowy lub wygasły token',
        });
    }
}

export default defineEventHandler(async (event) => {
    const userIdRaw = getRouterParam(event, 'userId');
    const studentUserId = userIdRaw?.trim() ?? '';

    if (!studentUserId) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora kursanta.',
        });
    }

    if (!isUuid(studentUserId)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator kursanta.',
        });
    }

    const queryString = readStudentEventsQueryString(
        getQuery(event) as Record<string, unknown>,
    );

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamStudentEvents(
            event,
            upstream,
            studentUserId,
            queryString,
        );
    }

    await assertMockStudentOwnsEventsRoute(event, studentUserId);

    return {
        success: true,
        data: { items: [] as unknown[] },
    };
});
