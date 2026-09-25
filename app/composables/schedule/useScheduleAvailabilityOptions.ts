import type { MaybeRefOrGetter } from 'vue';
import type {
    ScheduleAvailabilityOptionsRequest,
    ScheduleAvailabilityOptionsResult,
} from '~/types/schedule/scheduleAvailability';
import { useDebouncedAbortableRequest } from './useDebouncedAbortableRequest';

type OptionsFetcher = (
    candidate: ScheduleAvailabilityOptionsRequest,
    signal: AbortSignal,
) => Promise<ScheduleAvailabilityOptionsResult>;

interface UseScheduleAvailabilityOptionsOptions {
    candidate: MaybeRefOrGetter<ScheduleAvailabilityOptionsRequest | null>;
    debounceMs?: number;
    fetcher?: OptionsFetcher;
}

async function defaultFetcher(
    candidate: ScheduleAvailabilityOptionsRequest,
    signal: AbortSignal,
): Promise<ScheduleAvailabilityOptionsResult> {
    return await requestBffData<ScheduleAvailabilityOptionsResult>(
        'POST',
        '/api/schedule/availability-options',
        {
            body: candidate,
            signal,
            fallbackMessage: 'Nie udało się pobrać dostępnych godzin.',
        },
    );
}

export function useScheduleAvailabilityOptions(
    options: UseScheduleAvailabilityOptionsOptions,
) {
    const request = useDebouncedAbortableRequest<
        ScheduleAvailabilityOptionsRequest,
        ScheduleAvailabilityOptionsResult
    >({
        candidate: options.candidate,
        debounceMs: options.debounceMs ?? 150,
        fetcher: options.fetcher ?? defaultFetcher,
    });

    return {
        status: request.status,
        result: request.result,
        reload: request.execute,
    };
}
