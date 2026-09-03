import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';

const fetchScheduleForInstructor = vi.fn();

function installNuxtScheduleDataGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('useScheduleApi', () => ({
        fetchScheduleForInstructor,
    }));
}

function createScheduleItem(
    overrides: Partial<ScheduleLessonItem> = {},
): ScheduleLessonItem {
    return {
        id: 'lesson-1',
        kind: 'lesson',
        type: 'PRACTICE',
        status: 'PLANNED',
        startTime: '2026-09-03T09:00:00.000Z',
        endTime: '2026-09-03T10:00:00.000Z',
        ...overrides,
    };
}

describe('useManagerInstructorScheduleData', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        installNuxtScheduleDataGlobals();
    });

    it('clears items and skips API calls without instructor id', async () => {
        const { useManagerInstructorScheduleData } =
            await import('./useManagerInstructorScheduleData');
        const data = useManagerInstructorScheduleData({
            instructorId: ref(''),
            range: ref({ dateFrom: '2026-09-01', dateTo: '2026-09-07' }),
        });

        data.items.value = [createScheduleItem()];
        await data.loadSchedule();

        expect(fetchScheduleForInstructor).not.toHaveBeenCalled();
        expect(data.items.value).toEqual([]);
        expect(data.isScheduleLoading.value).toBe(false);
    });

    it('loads schedule for instructor and selected range', async () => {
        const item = createScheduleItem();

        fetchScheduleForInstructor.mockResolvedValue([item]);

        const { useManagerInstructorScheduleData } =
            await import('./useManagerInstructorScheduleData');
        const data = useManagerInstructorScheduleData({
            instructorId: ref('instructor-1'),
            range: ref({ dateFrom: '2026-09-01', dateTo: '2026-09-07' }),
        });

        await data.loadSchedule();

        expect(fetchScheduleForInstructor).toHaveBeenCalledWith(
            'instructor-1',
            '2026-09-01',
            '2026-09-07',
        );
        expect(data.items.value).toEqual([item]);
        expect(data.scheduleError.value).toBeNull();
        expect(data.isScheduleLoading.value).toBe(false);
    });

    it('exposes API error and clears stale items on load failure', async () => {
        fetchScheduleForInstructor.mockRejectedValue(new Error('API down'));

        const { useManagerInstructorScheduleData } =
            await import('./useManagerInstructorScheduleData');
        const data = useManagerInstructorScheduleData({
            instructorId: ref('instructor-1'),
            range: ref({ dateFrom: '2026-09-01', dateTo: '2026-09-07' }),
        });

        data.items.value = [createScheduleItem()];
        await data.loadSchedule();

        expect(data.items.value).toEqual([]);
        expect(data.scheduleError.value).toBe('API down');
        expect(data.isScheduleLoading.value).toBe(false);
    });

    it('ignores stale schedule responses from older requests', async () => {
        let resolveFirst!: (items: ScheduleLessonItem[]) => void;

        fetchScheduleForInstructor
            .mockReturnValueOnce(
                new Promise<ScheduleLessonItem[]>((resolve) => {
                    resolveFirst = resolve;
                }),
            )
            .mockResolvedValueOnce([createScheduleItem({ id: 'second' })]);

        const { useManagerInstructorScheduleData } =
            await import('./useManagerInstructorScheduleData');
        const range = ref({
            dateFrom: '2026-09-01',
            dateTo: '2026-09-07',
        });
        const data = useManagerInstructorScheduleData({
            instructorId: ref('instructor-1'),
            range,
        });

        const firstLoad = data.loadSchedule();

        range.value = { dateFrom: '2026-09-08', dateTo: '2026-09-14' };

        const secondLoad = data.loadSchedule();

        await secondLoad;

        expect(data.items.value.map((item) => item.id)).toEqual(['second']);

        resolveFirst([createScheduleItem({ id: 'first' })]);
        await firstLoad;

        expect(data.items.value.map((item) => item.id)).toEqual(['second']);
        expect(data.isScheduleLoading.value).toBe(false);
    });
});
