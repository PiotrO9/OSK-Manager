import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';

describe('useEventStudentPickerCapacityState', () => {
    beforeEach(() => {
        vi.stubGlobal('computed', computed);
    });

    it('derives capacity state from current capacity and selection', async () => {
        const capacity = ref<number | null>(2);
        const selectedCount = ref(1);
        const { useEventStudentPickerCapacityState } =
            await import('./useEventStudentPickerCapacityState');

        const state = useEventStudentPickerCapacityState({
            capacity: () => capacity.value,
            selectedCount: () => selectedCount.value,
        });

        expect(state.capacityNumber.value).toBe(2);
        expect(state.remainingSlots.value).toBe(1);
        expect(state.isCapacityReached.value).toBe(false);

        selectedCount.value = 2;

        expect(state.remainingSlots.value).toBe(0);
        expect(state.isCapacityReached.value).toBe(true);
    });
});
