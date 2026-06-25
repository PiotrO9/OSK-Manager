import { bffWeeklyDelete } from '~~/server/utils/availabilityBff';
import { mockAvailabilityDeleteDay } from '~~/server/utils/mockAvailabilityStore';
import { parseRequiredUuidRouterParam } from '~~/server/utils/requestValidation';

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

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffWeeklyDelete(event, upstream, id, dayOfWeek);
    }

    await requireManagerFromCookie(event);

    mockAvailabilityDeleteDay(id, dayOfWeek);

    return { success: true };
});
