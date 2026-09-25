import { computed, type MaybeRefOrGetter } from 'vue';
import type {
    ScheduleAvailabilityRequest,
    ScheduleAvailabilityResult,
    ScheduleAvailabilityStatus,
} from '~/types/schedule/scheduleAvailability';
import { scheduleAvailabilityIssueMessage } from '~/types/schedule/scheduleAvailability';
import { useDebouncedAbortableRequest } from './useDebouncedAbortableRequest';

type AvailabilityFetcher = (
    candidate: ScheduleAvailabilityRequest,
    signal: AbortSignal,
) => Promise<ScheduleAvailabilityResult>;

interface UseScheduleAvailabilityCheckOptions {
    candidate: MaybeRefOrGetter<ScheduleAvailabilityRequest | null>;
    debounceMs?: number;
    fetcher?: AvailabilityFetcher;
    auto?: boolean;
}

async function defaultFetcher(
    candidate: ScheduleAvailabilityRequest,
    signal: AbortSignal,
): Promise<ScheduleAvailabilityResult> {
    return await requestBffData<ScheduleAvailabilityResult>(
        'POST',
        '/api/schedule/availability-check',
        {
            body: candidate,
            signal,
            fallbackMessage: 'Nie udało się sprawdzić dostępności.',
        },
    );
}

export function useScheduleAvailabilityCheck(
    options: UseScheduleAvailabilityCheckOptions,
) {
    const request = useDebouncedAbortableRequest<
        ScheduleAvailabilityRequest,
        ScheduleAvailabilityResult
    >({
        candidate: options.candidate,
        debounceMs: options.debounceMs ?? 250,
        fetcher: options.fetcher ?? defaultFetcher,
        auto: options.auto,
    });
    const status = computed<ScheduleAvailabilityStatus>(() => {
        if (request.status.value === 'loading') return 'checking';

        if (request.status.value === 'error') return 'error';

        if (request.status.value !== 'success' || !request.result.value) {
            return 'idle';
        }

        return request.result.value.available ? 'available' : 'unavailable';
    });
    const result = request.result;

    const message = computed(() => {
        if (status.value === 'checking') return 'Sprawdzanie dostępności...';

        if (status.value === 'available') return 'Termin jest dostępny.';

        if (status.value === 'error') {
            return 'Nie udało się sprawdzić dostępności. Zapis zweryfikuje termin ponownie.';
        }

        const firstIssue = result.value?.issues[0];

        return firstIssue ? scheduleAvailabilityIssueMessage(firstIssue) : '';
    });

    async function check(): Promise<ScheduleAvailabilityStatus> {
        await request.execute();

        return status.value;
    }

    return {
        status,
        result,
        message,
        recheck: check,
    };
}
