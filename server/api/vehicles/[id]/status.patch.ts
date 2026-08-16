import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';
import type { BffVehicleStatusBody } from '~~/server/utils/vehicles/vehiclesBff';
import { bffUpstreamVehiclesUpdateStatus } from '~~/server/utils/vehicles/vehiclesBff';

function isDateYmd(value: string): boolean {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) return false;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

function parseVehicleStatus(raw: unknown): BffVehicleStatusBody | null {
    if (!raw || typeof raw !== 'object') return null;

    const body = raw as { status?: unknown; unavailableUntil?: unknown };
    const value = body.status;
    const status = typeof value === 'string' ? value.trim().toUpperCase() : '';

    if (status !== 'ACTIVE' && status !== 'UNAVAILABLE') {
        return null;
    }

    if (body.unavailableUntil === undefined || body.unavailableUntil === '') {
        return { status };
    }

    if (body.unavailableUntil === null) {
        return { status, unavailableUntil: null };
    }

    if (
        typeof body.unavailableUntil !== 'string' ||
        !isDateYmd(body.unavailableUntil)
    ) {
        return null;
    }

    return {
        status,
        unavailableUntil: body.unavailableUntil,
    };
}

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora pojazdu.',
        invalid: 'Nieprawidłowy identyfikator pojazdu.',
    });

    const body = await readBody(event);
    const payload = parseVehicleStatus(body);

    if (!payload) {
        throw createError({
            statusCode: 400,
            message:
                'Pole status musi być ACTIVE albo UNAVAILABLE, a unavailableUntil datą YYYY-MM-DD.',
        });
    }

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamVehiclesUpdateStatus(event, upstreamBase, id, payload),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockVehiclesUpdateStatus(id, payload);
        },
    });
});
