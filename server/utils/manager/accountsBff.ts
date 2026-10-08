import type { H3Event } from 'h3';
import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export function accountSchoolId(event: H3Event): string {
    const value = getQuery(event).schoolId;

    if (
        typeof value !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(value)
    ) {
        throw createError({
            statusCode: 400,
            message: 'Wybierz poprawny ośrodek.',
        });
    }

    return value;
}

export function accountUserId(event: H3Event): string {
    return parseRequiredUuidRouterParam(event, 'userId', {
        required: 'Brak identyfikatora konta.',
        invalid: 'Nieprawidłowy identyfikator konta.',
    });
}

export async function forwardManagerAccount(
    event: H3Event,
    path: string,
    method: 'GET' | 'PATCH' | 'POST',
    body?: unknown,
) {
    const schoolId = accountSchoolId(event);

    return executeBffAdapter(event, {
        upstream: async ({ upstreamBase }) => {
            const { data } = await upstreamRequest(event, upstreamBase, {
                path,
                method,
                query: { schoolId },
                body,
                fallbackError: 'Nie udało się wykonać operacji na koncie.',
            });

            return { success: true, data };
        },
        mock: () => {
            throw createError({
                statusCode: 503,
                message: 'Zarządzanie kontami wymaga połączenia z backendem.',
            });
        },
    });
}
