import type { ComputedRef, Ref } from 'vue';
import type { FreeWindow, InstructorEvent } from '~/types/instructorEvent';
import { slotsToFreeWindows } from '~/utils/freeWindows';

export function useManagerEventSlots(input: {
    formInstructorId: Ref<string>;
    currentFormDate: ComputedRef<string>;
    freeWindows: Ref<FreeWindow[]>;
    freeWindowsUnavailable: Ref<boolean>;
}) {
    const { fetchSlots: fetchInstructorSlots, isLoading: isSlotsLoading } =
        useInstructorSlotsApi(input.formInstructorId);
    let skipSlotsRefreshAfterLoad = false;

    function syncFreeWindowsFromEvent(ev: InstructorEvent): void {
        const fw = ev.freeWindows;

        if (!Array.isArray(fw)) {
            return;
        }

        input.freeWindows.value = fw;
        input.freeWindowsUnavailable.value = fw.length === 0;
    }

    async function refreshFreeWindowsFromSlots(date: string): Promise<void> {
        const instId = input.formInstructorId.value.trim();
        const d = date.trim();

        if (!instId || !d) {
            return;
        }

        try {
            const slots = await fetchInstructorSlots(d, d);
            const windows = slotsToFreeWindows(slots, d);

            input.freeWindows.value = windows;
            input.freeWindowsUnavailable.value = windows.length === 0;
        } catch {
            // Keep last known windows when the slot refresh fails.
        }
    }

    function skipNextSlotsRefresh(): void {
        skipSlotsRefreshAfterLoad = true;
    }

    watch(
        [input.currentFormDate, input.formInstructorId],
        ([newDate, newInst], [oldDate, oldInst]) => {
            if (skipSlotsRefreshAfterLoad) {
                skipSlotsRefreshAfterLoad = false;

                return;
            }

            if (newDate === oldDate && newInst === oldInst) {
                return;
            }

            const d = newDate?.trim();
            const ins = (newInst ?? '').trim();

            if (!d || !ins) {
                return;
            }

            void refreshFreeWindowsFromSlots(d);
        },
    );

    return {
        isSlotsLoading,
        syncFreeWindowsFromEvent,
        refreshFreeWindowsFromSlots,
        skipNextSlotsRefresh,
    };
}
