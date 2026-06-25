import { bffWeeklyPut } from '~~/server/utils/availabilityBff';
import { mockAvailabilityUpsertDay } from '~~/server/utils/mockAvailabilityStore';
import { parseRequiredUuidRouterParam } from '~~/server/utils/requestValidation';

const TIME_REGEX = /^\d{2}:\d{2}$/;

function isValidTime(value: unknown): value is string {
    return typeof value === 'string' && TIME_REGEX.test(value);
}

function parseDayParam(raw: string | undefined): number | null {
    if (!raw) return null;

    const n = parseInt(raw, 10);

    if (Number.isNaN(n) || n < 0 || n > 6) return null;

    return n;
}

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora instruktora.',
        invalid: 'Nieprawidłowy identyfikator instruktora.',
    });

    const dayRaw = getRouterParam(event, 'day');
    const dayOfWeek = parseDayParam(dayRaw);

    if (dayOfWeek === null) {
        throw createError({
            statusCode: 400,
            message: 'Parametr day musi być liczbą od 0 do 6.',
        });
    }

    const body = await readBody<unknown>(event);

    if (!body || typeof body !== 'object') {
        throw createError({
            statusCode: 400,
            message: 'Brak ciała żądania.',
        });
    }

    const { startTime, endTime } = body as Record<string, unknown>;

    if (!isValidTime(startTime)) {
        throw createError({
            statusCode: 400,
            message: 'startTime musi być w formacie HH:mm.',
        });
    }

    if (!isValidTime(endTime)) {
        throw createError({
            statusCode: 400,
            message: 'endTime musi być w formacie HH:mm.',
        });
    }

    if (startTime >= endTime) {
        throw createError({
            statusCode: 400,
            message: 'startTime musi być wcześniejszy niż endTime.',
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffWeeklyPut(event, upstream, id, dayOfWeek, {
            startTime,
            endTime,
        });
    }

    await requireManagerFromCookie(event);

    const entry = mockAvailabilityUpsertDay(id, dayOfWeek, startTime, endTime);

    return {
        success: true,
        data: { entry },
    };
});
