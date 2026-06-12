import {
    mockVehiclesGetById,
    mockVehiclesResponseFromRow,
    mockVehiclesUpdateStatus,
    type MockVehicleStatus,
} from '~~/server/utils/mockVehiclesStore';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';
import { bffUpstreamVehiclesUpdateStatus } from '~~/server/utils/vehiclesBff';

function parseVehicleStatus(raw: unknown): MockVehicleStatus | null {
    if (!raw || typeof raw !== 'object') return null;

    const value = (raw as { status?: unknown }).status;
    const status = typeof value === 'string' ? value.trim().toUpperCase() : '';

    return status === 'ACTIVE' || status === 'UNAVAILABLE' ? status : null;
}

export default defineEventHandler(async (event) => {
    const idRaw = getRouterParam(event, 'id');
    const id = idRaw?.trim() ?? '';

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Brak identyfikatora pojazdu.',
        });
    }

    if (!isUuid(id)) {
        throw createError({
            statusCode: 400,
            message: 'NieprawidĹ‚owy identyfikator pojazdu.',
        });
    }

    const body = await readBody(event);
    const status = parseVehicleStatus(body);

    if (!status) {
        throw createError({
            statusCode: 400,
            message: 'Pole status musi byÄ‡ ACTIVE albo UNAVAILABLE.',
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamVehiclesUpdateStatus(event, upstream, id, {
            status,
        });
    }

    await requireManagerFromCookie(event);

    const existing = mockVehiclesGetById(id);

    if (!existing) {
        throw createError({
            statusCode: 404,
            message: 'Pojazd nie istnieje.',
        });
    }

    const updated = mockVehiclesUpdateStatus(id, status);

    if (!updated) {
        throw createError({
            statusCode: 404,
            message: 'Pojazd nie istnieje.',
        });
    }

    return {
        success: true,
        data: mockVehiclesResponseFromRow(updated),
    };
});
