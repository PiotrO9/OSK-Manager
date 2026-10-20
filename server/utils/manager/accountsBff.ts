import type { H3Event } from 'h3';
import { managerAccountsQuerySchema } from '~~/shared/validation/managerAccounts';
import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';
import {
    parseRequiredUuidRouterParam,
    parseOptionalUuidQuery,
} from '~~/server/utils/validation/requestValidation';

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
    const listQuery =
        path === '/manager/accounts'
            ? managerAccountsQuerySchema.safeParse(getQuery(event))
            : null;

    if (listQuery && !listQuery.success) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowe parametry wyszukiwania kont.',
        });
    }

    const schoolId = listQuery?.success
        ? listQuery.data.schoolId
        : parseOptionalUuidQuery(getQuery(event));

    return executeBffAdapter(event, {
        upstream: async ({ upstreamBase }) => {
            const { data } = await upstreamRequest(event, upstreamBase, {
                path,
                method,
                query: listQuery?.success
                    ? listQuery.data
                    : schoolId
                      ? { schoolId }
                      : undefined,
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
