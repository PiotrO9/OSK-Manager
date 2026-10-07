import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, nextTick, ref, watch } from 'vue';

function installVueGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('watch', watch);
}

describe('useManagerEventEditTimePicker', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        installVueGlobals();
    });

    it('hydrates split fields from local start and end datetimes', async () => {
        const formStartLocal = ref('');
        const formEndLocal = ref('');
        const { useManagerEventEditTimePicker } =
            await import('./useManagerEventEditTimePicker');
        const picker = useManagerEventEditTimePicker({
            formStartLocal,
            formEndLocal,
        });

        formStartLocal.value = '2026-08-16T10:30';
        formEndLocal.value = '2026-08-16T11:45';
        await nextTick();

        expect(picker.formStartDate.value).toBe('2026-08-16');
        expect(picker.formStartHour.value).toBe(10);
        expect(picker.formStartMinute.value).toBe(30);
        expect(picker.formEndDate.value).toBe('2026-08-16');
        expect(picker.formEndHour.value).toBe(11);
        expect(picker.formEndMinute.value).toBe(45);
        expect(picker.currentFormDate.value).toBe('2026-08-16');
    });

    it('moves end local forward when it is not after start local', async () => {
        const formStartLocal = ref('2026-08-16T10:00');
        const formEndLocal = ref('2026-08-16T09:00');
        const { useManagerEventEditTimePicker } =
            await import('./useManagerEventEditTimePicker');

        useManagerEventEditTimePicker({
            formStartLocal,
            formEndLocal,
        });

        formEndLocal.value = '2026-08-16T09:30';
        await nextTick();

        expect(formEndLocal.value).toBe('2026-08-16T11:00');
    });

    it('suggests the next local day when the start crosses midnight', async () => {
        const formStartLocal = ref('2026-08-16T23:30');
        const formEndLocal = ref('2026-08-16T23:00');
        const { useManagerEventEditTimePicker } =
            await import('./useManagerEventEditTimePicker');

        useManagerEventEditTimePicker({ formStartLocal, formEndLocal });

        formEndLocal.value = '2026-08-16T23:15';
        await nextTick();

        expect(formEndLocal.value).toBe('2026-08-17T00:30');
    });
});
