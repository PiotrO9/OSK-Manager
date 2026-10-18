import type {
    SecurityLogDetail,
    SecurityLogFilterOptionsData,
    SecurityLogsListData,
} from '~/types/security-logs/securityLog';
import type { SecurityLogFilterRule } from '~~/shared/utils/securityLogFilters';

function url(
    path: string,
    query: Record<string, string | number | undefined>,
): string {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== '') params.set(key, String(value));
    }

    return `${path}?${params.toString()}`;
}

export function useSecurityLogsApi() {
    function fetchList(options: {
        schoolId: string;
        cursor?: string;
        search?: string;
        view?: string;
        rules: SecurityLogFilterRule[];
        signal?: AbortSignal;
    }) {
        return requestBffData<SecurityLogsListData>(
            'GET',
            url('/api/manager/security-logs', {
                schoolId: options.schoolId,
                limit: 20,
                cursor: options.cursor,
                search: options.search,
                view: options.view === 'all' ? undefined : options.view,
                filters: JSON.stringify({ rules: options.rules }),
            }),
            {
                fallbackMessage: 'Nie udało się pobrać logów bezpieczeństwa.',
                signal: options.signal,
            },
        );
    }

    function fetchDetail(
        schoolId: string,
        eventId: string,
        signal?: AbortSignal,
    ) {
        return requestBffData<SecurityLogDetail>(
            'GET',
            url(`/api/manager/security-logs/${encodeURIComponent(eventId)}`, {
                schoolId,
            }),
            {
                fallbackMessage: 'Nie udało się pobrać szczegółów zdarzenia.',
                signal,
            },
        );
    }

    function fetchPersonOptions(options: {
        schoolId: string;
        kind: 'actor' | 'target';
        search?: string;
        cursor?: string;
        signal?: AbortSignal;
    }) {
        return requestBffData<SecurityLogFilterOptionsData>(
            'GET',
            url('/api/manager/security-logs/filter-options', {
                schoolId: options.schoolId,
                kind: options.kind,
                search: options.search,
                cursor: options.cursor,
                limit: 20,
            }),
            {
                fallbackMessage: 'Nie udało się pobrać osób.',
                signal: options.signal,
            },
        );
    }

    return { fetchList, fetchDetail, fetchPersonOptions };
}
