import { computed, effectScope, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useScheduleAvailabilityCheck } from './useScheduleAvailabilityCheck';

const candidateValue = {
    intent: 'event_create' as const,
    instructorId: 'instructor-1',
    eventType: 'THEORY' as const,
    date: '2026-09-24',
    startTime: '10:00',
    endTime: '11:00',
};

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((done) => {
        resolve = done;
    });

    return { promise, resolve };
}

describe('useScheduleAvailabilityCheck', () => {
    afterEach(() => vi.useRealTimers());

    it('stays idle until the candidate is complete', async () => {
        const candidate = ref<typeof candidateValue | null>(null);
        const fetcher = vi.fn();
        const check = useScheduleAvailabilityCheck({ candidate, fetcher });

        await nextTick();

        expect(check.status.value).toBe('idle');
        expect(fetcher).not.toHaveBeenCalled();
    });

    it('debounces a candidate and exposes an unavailable issue', async () => {
        vi.useFakeTimers();
        const candidate = ref(candidateValue);
        const fetcher = vi.fn().mockResolvedValue({
            available: false,
            issues: [{ code: 'INSTRUCTOR_BUSY', field: 'instructorId' }],
            policy: { minDurationMinutes: 45, maxDurationMinutes: 90 },
        });
        const check = useScheduleAvailabilityCheck({
            candidate,
            fetcher,
            debounceMs: 100,
        });

        await vi.advanceTimersByTimeAsync(100);

        expect(fetcher).toHaveBeenCalledOnce();
        expect(check.status.value).toBe('unavailable');
        expect(check.message.value).toBe(
            'Instruktor nie jest dostępny w tym terminie.',
        );
    });

    it('explains when the candidate is outside instructor working hours', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            available: false,
            issues: [
                {
                    code: 'OUTSIDE_INSTRUCTOR_HOURS',
                    field: 'instructorId',
                },
            ],
            policy: { minDurationMinutes: 60, maxDurationMinutes: 120 },
        });
        const check = useScheduleAvailabilityCheck({
            candidate: ref(candidateValue),
            fetcher,
            debounceMs: 0,
        });

        await check.recheck();

        expect(check.status.value).toBe('unavailable');
        expect(check.message.value).toBe(
            'Termin wykracza poza godziny pracy instruktora.',
        );
    });

    it('does not allow an older response to overwrite a newer result', async () => {
        vi.useFakeTimers();
        const candidate = ref(candidateValue);
        const first = deferred<{
            available: boolean;
            issues: never[];
            policy: { minDurationMinutes: number; maxDurationMinutes: number };
        }>();
        const second = deferred<{
            available: boolean;
            issues: never[];
            policy: { minDurationMinutes: number; maxDurationMinutes: number };
        }>();
        const fetcher = vi
            .fn()
            .mockReturnValueOnce(first.promise)
            .mockReturnValueOnce(second.promise);
        const check = useScheduleAvailabilityCheck({
            candidate: computed(() => candidate.value),
            fetcher,
            debounceMs: 10,
        });

        await vi.advanceTimersByTimeAsync(10);
        candidate.value = { ...candidateValue, startTime: '11:00' };
        await nextTick();
        await vi.advanceTimersByTimeAsync(10);
        second.resolve({
            available: true,
            issues: [],
            policy: { minDurationMinutes: 45, maxDurationMinutes: 90 },
        });
        await Promise.resolve();
        first.resolve({
            available: false,
            issues: [],
            policy: { minDurationMinutes: 45, maxDurationMinutes: 90 },
        });
        await Promise.resolve();

        expect(check.status.value).toBe('available');
    });

    it('cancels the pending debounce when explicitly rechecked', async () => {
        vi.useFakeTimers();
        const fetcher = vi.fn().mockResolvedValue({
            available: true,
            issues: [],
            policy: { minDurationMinutes: 45, maxDurationMinutes: 90 },
        });
        const check = useScheduleAvailabilityCheck({
            candidate: ref(candidateValue),
            fetcher,
            debounceMs: 100,
        });

        await check.recheck();
        await vi.advanceTimersByTimeAsync(100);

        expect(fetcher).toHaveBeenCalledOnce();
    });

    it.each([true, false])(
        'resolves a same-tick candidate update and manual recheck with auto=%s',
        async (auto) => {
            vi.useFakeTimers();
            const candidate = ref<typeof candidateValue | null>(null);
            const fetcher = vi.fn().mockResolvedValue({
                available: false,
                issues: [{ code: 'INSTRUCTOR_BUSY', field: 'instructorId' }],
                policy: { minDurationMinutes: 45, maxDurationMinutes: 90 },
            });
            const check = useScheduleAvailabilityCheck({
                candidate,
                fetcher,
                debounceMs: 100,
                auto,
            });

            candidate.value = candidateValue;

            const status = await check.recheck();

            await vi.advanceTimersByTimeAsync(100);

            expect(status).toBe('unavailable');
            expect(check.status.value).toBe('unavailable');
            expect(fetcher).toHaveBeenCalledOnce();
        },
    );

    it('can defer the exact check until submit when options drive the picker', async () => {
        vi.useFakeTimers();
        const fetcher = vi.fn().mockResolvedValue({
            available: true,
            issues: [],
            policy: { minDurationMinutes: 60, maxDurationMinutes: 120 },
        });
        const check = useScheduleAvailabilityCheck({
            candidate: ref(candidateValue),
            fetcher,
            debounceMs: 10,
            auto: false,
        });

        await vi.advanceTimersByTimeAsync(20);

        expect(check.status.value).toBe('idle');
        expect(fetcher).not.toHaveBeenCalled();

        await check.recheck();

        expect(fetcher).toHaveBeenCalledOnce();
        expect(check.status.value).toBe('available');
    });

    it('exposes an unknown state when the availability request fails', async () => {
        const fetcher = vi.fn().mockRejectedValue(new Error('network down'));
        const check = useScheduleAvailabilityCheck({
            candidate: ref(candidateValue),
            fetcher,
            debounceMs: 0,
        });

        await check.recheck();

        expect(check.status.value).toBe('error');
        expect(check.result.value).toBeNull();
        expect(check.message.value).toContain(
            'Zapis zweryfikuje termin ponownie',
        );
    });

    it('aborts an in-flight request when the candidate becomes incomplete', async () => {
        const candidate = ref<typeof candidateValue | null>(candidateValue);
        let receivedSignal: AbortSignal | undefined;
        const fetcher = vi.fn(
            (_candidate: unknown, signal: AbortSignal): Promise<never> => {
                receivedSignal = signal;

                return new Promise<never>(() => undefined);
            },
        );
        const check = useScheduleAvailabilityCheck({ candidate, fetcher });

        void check.recheck();
        await Promise.resolve();
        candidate.value = null;
        await nextTick();

        expect(receivedSignal?.aborted).toBe(true);
        expect(check.status.value).toBe('idle');
        expect(check.result.value).toBeNull();
    });

    it('aborts an in-flight request when its Vue scope is disposed', async () => {
        let receivedSignal: AbortSignal | undefined;
        const fetcher = vi.fn(
            (_candidate: unknown, signal: AbortSignal): Promise<never> => {
                receivedSignal = signal;

                return new Promise<never>(() => undefined);
            },
        );
        const scope = effectScope();
        const check = scope.run(() =>
            useScheduleAvailabilityCheck({
                candidate: ref(candidateValue),
                fetcher,
            }),
        );

        void check?.recheck();
        await Promise.resolve();
        scope.stop();

        expect(receivedSignal?.aborted).toBe(true);
    });
});
