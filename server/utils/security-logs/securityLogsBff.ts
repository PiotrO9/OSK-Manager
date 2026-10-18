import type { H3Event } from 'h3';
import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamMe } from '~~/server/utils/auth/authUpstreamSession';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';
import { parseSecurityLogFilters } from '~~/shared/utils/securityLogFilters';
import { reportBffMissingSession } from './bffDenialTelemetry';

type Query = Record<string, string>;

function requiredString(
    value: unknown,
    label: string,
    maxLength = 200,
): string {
    if (
        typeof value !== 'string' ||
        !value.trim() ||
        value.length > maxLength
    ) {
        throw createError({
            statusCode: 400,
            message: `Nieprawidłowy parametr ${label}.`,
        });
    }

    return value;
}

function optionalString(
    value: unknown,
    label: string,
    maxLength: number,
): string | undefined {
    if (value === undefined) return undefined;

    return requiredString(value, label, maxLength);
}

function readQuery(event: H3Event, mode: 'list' | 'detail' | 'options'): Query {
    const raw = getQuery(event);
    const allowed =
        mode === 'list'
            ? ['schoolId', 'limit', 'cursor', 'search', 'view', 'filters']
            : mode === 'options'
              ? ['schoolId', 'kind', 'search', 'cursor', 'limit']
              : ['schoolId'];

    if (Object.keys(raw).some((key) => !allowed.includes(key))) {
        throw createError({
            statusCode: 400,
            message: 'Nieznany parametr zapytania.',
        });
    }

    const schoolId = requiredString(raw.schoolId, 'schoolId', 80);

    if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            schoolId,
        )
    ) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator OSK.',
        });
    }

    const query: Query = { schoolId };

    if (mode === 'detail') return query;

    const search = optionalString(raw.search, 'search', 120);

    if (search) query.search = search;

    const cursor = optionalString(
        raw.cursor,
        'cursor',
        mode === 'options' ? 256 : 2048,
    );

    if (cursor) query.cursor = cursor;

    if (raw.limit !== undefined) {
        const limit = Number(requiredString(raw.limit, 'limit', 3));

        if (
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > (mode === 'options' ? 50 : 100)
        )
            throw createError({
                statusCode: 400,
                message: 'Limit musi wynosić od 1 do 100.',
            });

        query.limit = String(limit);
    }

    if (mode === 'options') {
        const kind = requiredString(raw.kind, 'kind', 6);

        if (kind !== 'actor' && kind !== 'target')
            throw createError({
                statusCode: 400,
                message: 'Nieprawidłowy rodzaj osoby.',
            });

        query.kind = kind;

        return query;
    }

    if (raw.view !== undefined) {
        const view = requiredString(raw.view, 'view', 40);

        if (
            ![
                'all',
                'failed-logins',
                'suspicious',
                'access-denied',
                'account-changes',
            ].includes(view)
        )
            throw createError({
                statusCode: 400,
                message: 'Nieprawidłowy szybki widok.',
            });

        query.view = view;
    }

    if (raw.filters !== undefined) {
        const filters = requiredString(raw.filters, 'filters', 4096);

        if (!parseSecurityLogFilters(filters))
            throw createError({
                statusCode: 400,
                message: 'Nieprawidłowe filtry.',
            });

        query.filters = filters;
    }

    return query;
}

export async function forwardSecurityLogs(
    event: H3Event,
    mode: 'list' | 'detail' | 'options',
    eventId?: string,
) {
    setHeader(event, 'Cache-Control', 'private, no-store, max-age=0');
    setHeader(event, 'Pragma', 'no-cache');
    const query = readQuery(event, mode);

    if (mode === 'detail' && (!eventId || !/^[0-9a-f-]{36}$/i.test(eventId))) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator zdarzenia.',
        });
    }

    const path =
        mode === 'detail'
            ? `/manager/security-logs/${encodeURIComponent(eventId!)}`
            : mode === 'options'
              ? '/manager/security-logs/filter-options'
              : '/manager/security-logs';

    return executeBffAdapter(event, {
        upstream: async ({ upstreamBase }) => {
            const hadSessionCookie = Boolean(
                getCookie(event, 'access_token') ||
                getCookie(event, 'refresh_token'),
            );

            try {
                await bffUpstreamMe(event, upstreamBase);
            } catch (error) {
                if (
                    !hadSessionCookie &&
                    error &&
                    typeof error === 'object' &&
                    'statusCode' in error &&
                    error.statusCode === 401
                ) {
                    await reportBffMissingSession(event, upstreamBase, {
                        path,
                        method: 'GET',
                        fallbackError:
                            'Nie udało się pobrać logów bezpieczeństwa.',
                    });
                }

                throw error;
            }

            const { data } = await upstreamRequest(event, upstreamBase, {
                path,
                method: 'GET',
                query,
                fallbackError: 'Nie udało się pobrać logów bezpieczeństwa.',
            });

            return { success: true, data };
        },
        mock: () => {
            throw createError({
                statusCode: 503,
                message: 'Logi bezpieczeństwa wymagają połączenia z backendem.',
            });
        },
    });
}
