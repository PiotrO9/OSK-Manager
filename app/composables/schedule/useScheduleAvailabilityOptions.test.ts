import { computed, effectScope, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useScheduleAvailabilityOptions } from './useScheduleAvailabilityOptions';

const candidateValue = {
    intent: 'event_create' as const,
    instructorId: 'instructor-1',
    eventType: 'DRIVE' as const,
    date: '2026-09-26',
    vehicleId: 'vehicle-1',
};

const resultValue = {
    stepMinutes: 15,
    options: [{ startTime: '10:00', endTimes: ['11:00', '11:15'] }],
    policy: { minDurationMinutes: 60, maxDurationMinutes: 120 },
};

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((done) => {
        resolve = done;
    });

    return { promise, resolve };
}

describe('useScheduleAvailabilityOptions', () => {
    afterEach(() => vi.useRealTimers());

    it('stays idle until date and required resources are complete', async () => {
        const fetcher = vi.fn();
        const options = useScheduleAvailabilityOptions({
            candidate: ref(null),
            fetcher,
        });

        await nextTick();

        expect(options.status.value).toBe('idle');
        expect(fetcher).not.toHaveBeenCalled();
    });

    it('debounces loading and exposes the returned slot matrix', async () => {
        vi.useFakeTimers();
        const fetcher = vi.fn().mockResolvedValue(resultValue);
        const options = useScheduleAvailabilityOptions({
            candidate: ref(candidateValue),
            fetcher,
            debounceMs: 100,
        });

        expect(options.status.value).toBe('loading');
        await vi.advanceTimersByTimeAsync(100);

        expect(fetcher).toHaveBeenCalledOnce();
        expect(options.status.value).toBe('success');
        expect(options.result.value).toEqual(resultValue);
    });

    it('does not let an older response replace options for newer form data', async () => {
        vi.useFakeTimers();
        const candidate = ref(candidateValue);
        const first = deferred<typeof resultValue>();
        const second = deferred<typeof resultValue>();
        const fetcher = vi
            .fn()
            .mockReturnValueOnce(first.promise)
            .mockReturnValueOnce(second.promise);
        const options = useScheduleAvailabilityOptions({
            candidate: computed(() => candidate.value),
            fetcher,
            debounceMs: 10,
        });

        await vi.advanceTimersByTimeAsync(10);
        candidate.value = { ...candidateValue, date: '2026-09-27' };
        await nextTick();
        await vi.advanceTimersByTimeAsync(10);
        second.resolve({ ...resultValue, options: [] });
        await Promise.resolve();
        first.resolve(resultValue);
        await Promise.resolve();

        expect(options.status.value).toBe('success');
        expect(options.result.value?.options).toEqual([]);
    });

    it('clears stale options and aborts a request when inputs become incomplete', async () => {
        const candidate = ref<typeof candidateValue | null>(candidateValue);
        let signal: AbortSignal | undefined;
        const fetcher = vi.fn(
            (_candidate: unknown, nextSignal: AbortSignal): Promise<never> => {
                signal = nextSignal;

                return new Promise<never>(() => undefined);
            },
        );
        const options = useScheduleAvailabilityOptions({
            candidate,
            fetcher,
            debounceMs: 0,
        });

        void options.reload();
        await Promise.resolve();
        candidate.value = null;
        await nextTick();

        expect(signal?.aborted).toBe(true);
        expect(options.status.value).toBe('idle');
        expect(options.result.value).toBeNull();
    });

    it('aborts an in-flight request when its Vue scope is disposed', async () => {
        let signal: AbortSignal | undefined;
        const fetcher = vi.fn(
            (_candidate: unknown, nextSignal: AbortSignal): Promise<never> => {
                signal = nextSignal;

                return new Promise<never>(() => undefined);
            },
        );
        const scope = effectScope();
        const options = scope.run(() =>
            useScheduleAvailabilityOptions({
                candidate: ref(candidateValue),
                fetcher,
            }),
        );

        void options?.reload();
        await Promise.resolve();
        scope.stop();

        expect(signal?.aborted).toBe(true);
    });
});
