import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import type { FreeWindow } from '~/types/events/instructorEvent';

function installVueGlobals(): void {
    vi.stubGlobal('ref', ref);
}

function changeEvent(value: string): Event {
    return { target: { value } } as unknown as Event;
}

describe('useManagerEventEditTimeSplit', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        installVueGlobals();
    });

    it('hydrates split fields from local datetimes', async () => {
        const { useManagerEventEditTimeSplit } =
            await import('./useManagerEventEditTimeSplit');
        const timeSplit = useManagerEventEditTimeSplit({
            formStartLocal: ref('2026-08-16T10:30'),
            formEndLocal: ref('2026-08-16T11:45'),
            freeWindows: ref<FreeWindow[]>([]),
            freeWindowsUnavailable: ref(false),
        });

        timeSplit.hydrateStartSplitFromLocal();
        timeSplit.hydrateEndSplitFromLocal();

        expect(timeSplit.formStartDate.value).toBe('2026-08-16');
        expect(timeSplit.formStartHour.value).toBe(10);
        expect(timeSplit.formStartMinute.value).toBe(30);
        expect(timeSplit.formEndDate.value).toBe('2026-08-16');
        expect(timeSplit.formEndHour.value).toBe(11);
        expect(timeSplit.formEndMinute.value).toBe(45);
    });

    it('commits valid start changes and clamps them to available free windows', async () => {
        const { useManagerEventEditTimeSplit } =
            await import('./useManagerEventEditTimeSplit');
        const formStartLocal = ref('');
        const timeSplit = useManagerEventEditTimeSplit({
            formStartLocal,
            formEndLocal: ref(''),
            freeWindows: ref<FreeWindow[]>([
                {
                    startTime: '2026-08-16T09:30:00.000Z',
                    endTime: '2026-08-16T12:00:00.000Z',
                },
            ]),
            freeWindowsUnavailable: ref(false),
        });

        timeSplit.handleStartDateChange(changeEvent('2026-08-16'));
        timeSplit.handleStartHourChange(changeEvent('8'));

        expect(timeSplit.formStartHour.value).toBe(11);
        expect(timeSplit.formStartMinute.value).toBe(30);
        expect(formStartLocal.value).toBe('2026-08-16T11:30');
    });

    it('ignores invalid hour and minute selections', async () => {
        const { useManagerEventEditTimeSplit } =
            await import('./useManagerEventEditTimeSplit');
        const formStartLocal = ref('2026-08-16T10:00');
        const timeSplit = useManagerEventEditTimeSplit({
            formStartLocal,
            formEndLocal: ref(''),
            freeWindows: ref<FreeWindow[]>([]),
            freeWindowsUnavailable: ref(false),
        });

        timeSplit.hydrateStartSplitFromLocal();
        timeSplit.handleStartHourChange(changeEvent('24'));
        timeSplit.handleStartMinuteChange(changeEvent('-1'));

        expect(timeSplit.formStartHour.value).toBe(10);
        expect(timeSplit.formStartMinute.value).toBe(0);
        expect(formStartLocal.value).toBe('2026-08-16T10:00');
    });
});
