import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import type { FreeWindow } from '~/types/events/instructorEvent';

function installVueGlobals(): void {
    vi.stubGlobal('ref', ref);
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

        timeSplit.handleDateChange('2026-08-16');
        timeSplit.handleStartTimeChange('08:00');

        expect(timeSplit.formStartHour.value).toBe(11);
        expect(timeSplit.formStartMinute.value).toBe(30);
        expect(formStartLocal.value).toBe('2026-08-16T11:30');
    });

    it('ignores invalid time selections', async () => {
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
        timeSplit.handleStartTimeChange('24:00');
        timeSplit.handleStartTimeChange('10:60');

        expect(timeSplit.formStartHour.value).toBe(10);
        expect(timeSplit.formStartMinute.value).toBe(0);
        expect(formStartLocal.value).toBe('2026-08-16T10:00');
    });

    it('updates both dates and full times from the shared pickers', async () => {
        const { useManagerEventEditTimeSplit } =
            await import('./useManagerEventEditTimeSplit');
        const formStartLocal = ref('2026-08-16T10:00');
        const formEndLocal = ref('2026-08-16T11:00');
        const timeSplit = useManagerEventEditTimeSplit({
            formStartLocal,
            formEndLocal,
            freeWindows: ref<FreeWindow[]>([]),
            freeWindowsUnavailable: ref(false),
        });

        timeSplit.hydrateStartSplitFromLocal();
        timeSplit.hydrateEndSplitFromLocal();
        timeSplit.handleDateChange('2026-08-17');
        timeSplit.handleStartTimeChange('09:30');
        timeSplit.handleEndTimeChange('10:45');

        expect(formStartLocal.value).toBe('2026-08-17T09:30');
        expect(formEndLocal.value).toBe('2026-08-17T10:45');
    });
});
