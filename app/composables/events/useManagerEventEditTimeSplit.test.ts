import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

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

    it('commits valid start changes without local window constraints', async () => {
        const { useManagerEventEditTimeSplit } =
            await import('./useManagerEventEditTimeSplit');
        const formStartLocal = ref('');
        const timeSplit = useManagerEventEditTimeSplit({
            formStartLocal,
            formEndLocal: ref(''),
        });

        timeSplit.handleDateChange('2026-08-16');
        timeSplit.handleStartTimeChange('08:00');

        expect(timeSplit.formStartHour.value).toBe(8);
        expect(timeSplit.formStartMinute.value).toBe(0);
        expect(formStartLocal.value).toBe('2026-08-16T08:00');
    });

    it('ignores invalid time selections', async () => {
        const { useManagerEventEditTimeSplit } =
            await import('./useManagerEventEditTimeSplit');
        const formStartLocal = ref('2026-08-16T10:00');
        const timeSplit = useManagerEventEditTimeSplit({
            formStartLocal,
            formEndLocal: ref(''),
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
