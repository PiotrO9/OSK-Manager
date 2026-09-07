import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref, watch } from 'vue';
import type { FreeWindow } from '~/types/events/instructorEvent';
import type { AvailabilitySlot } from '~/types/instructors/instructorSlots';

const fetchSlots = vi.fn();
const isSlotsLoading = ref(false);

function deferred<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

function slot(
    date: string,
    startTime: string,
    endTime: string,
): AvailabilitySlot {
    return {
        date,
        startTime,
        endTime,
        availableInstructors: [],
    } as AvailabilitySlot;
}

function installGlobals(): void {
    vi.stubGlobal('watch', watch);
    vi.stubGlobal('useInstructorSlotsApi', () => ({
        fetchSlots,
        isLoading: isSlotsLoading,
    }));
}

describe('useManagerEventSlots', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        isSlotsLoading.value = false;
        installGlobals();
    });

    it('keeps the latest slots response when refreshes overlap', async () => {
        const firstLoad = deferred<AvailabilitySlot[]>();
        const secondLoad = deferred<AvailabilitySlot[]>();
        const formInstructorId = ref('instructor-1');
        const currentFormDate = computed(() => '2026-09-03');
        const freeWindows = ref<FreeWindow[]>([]);
        const freeWindowsUnavailable = ref(false);

        fetchSlots
            .mockReturnValueOnce(firstLoad.promise)
            .mockReturnValueOnce(secondLoad.promise);

        const { useManagerEventSlots } = await import('./useManagerEventSlots');
        const data = useManagerEventSlots({
            formInstructorId,
            currentFormDate,
            freeWindows,
            freeWindowsUnavailable,
        });

        const firstPromise = data.refreshFreeWindowsFromSlots('2026-09-03');
        const secondPromise = data.refreshFreeWindowsFromSlots('2026-09-04');

        secondLoad.resolve([slot('2026-09-04', '12:00', '13:00')]);
        await secondPromise;

        expect(freeWindows.value).toEqual([
            {
                startTime: '2026-09-04T12:00:00.000Z',
                endTime: '2026-09-04T13:00:00.000Z',
            },
        ]);

        firstLoad.resolve([slot('2026-09-03', '09:00', '10:00')]);
        await firstPromise;

        expect(freeWindows.value).toEqual([
            {
                startTime: '2026-09-04T12:00:00.000Z',
                endTime: '2026-09-04T13:00:00.000Z',
            },
        ]);
    });
});
