import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';

const fetchSchoolSchedule = vi.fn();

function installNuxtSchoolScheduleDataGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('watch', vi.fn());
    vi.stubGlobal('useSchoolScheduleApi', () => ({
        fetchSchoolSchedule,
        isLoading: ref(false),
    }));
}

function scheduleLesson(
    overrides: Partial<ScheduleLessonItem> = {},
): ScheduleLessonItem {
    return {
        id: 'lesson-1',
        kind: 'lesson',
        type: 'PRACTICE',
        status: 'SCHEDULED',
        startTime: '2026-08-10T09:00:00',
        endTime: '2026-08-10T10:00:00',
        instructor: {
            id: 'instructor-1',
            firstName: 'Jan',
            lastName: 'Kowalski',
        },
        student: {
            id: 'student-1',
            firstName: 'Anna',
            lastName: 'Nowak',
        },
        ...overrides,
    };
}

describe('useManagerSchoolScheduleCalendarData', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        installNuxtSchoolScheduleDataGlobals();
    });

    it('clears local data and skips API calls without a school id', async () => {
        const { useManagerSchoolScheduleCalendarData } =
            await import('./useManagerSchoolScheduleCalendarData');

        const data = useManagerSchoolScheduleCalendarData({
            schoolId: () => ' ',
            weekStart: ref(new Date(2026, 7, 10)),
            disabled: () => false,
        });

        await data.loadWeek();

        expect(fetchSchoolSchedule).not.toHaveBeenCalled();
        expect(data.internalItems.value).toEqual([]);
        expect(data.errorMessage.value).toBeNull();
    });

    it('loads school schedule for the selected local week', async () => {
        const lesson = scheduleLesson();

        fetchSchoolSchedule.mockResolvedValue([lesson]);

        const { useManagerSchoolScheduleCalendarData } =
            await import('./useManagerSchoolScheduleCalendarData');

        const data = useManagerSchoolScheduleCalendarData({
            schoolId: () => ' school-1 ',
            weekStart: ref(new Date(2026, 7, 10)),
            disabled: () => false,
        });

        await data.loadWeek();

        expect(fetchSchoolSchedule).toHaveBeenLastCalledWith(
            'school-1',
            '2026-08-10',
            '2026-08-16',
        );
        expect(data.internalItems.value).toEqual([lesson]);
        expect(data.errorMessage.value).toBeNull();
    });

    it('ignores stale schedule responses from older requests', async () => {
        const firstLesson = scheduleLesson({ id: 'first' });
        const secondLesson = scheduleLesson({ id: 'second' });
        let resolveFirst!: (items: ScheduleLessonItem[]) => void;

        fetchSchoolSchedule
            .mockReturnValueOnce(
                new Promise<ScheduleLessonItem[]>((resolve) => {
                    resolveFirst = resolve;
                }),
            )
            .mockResolvedValueOnce([secondLesson]);

        const { useManagerSchoolScheduleCalendarData } =
            await import('./useManagerSchoolScheduleCalendarData');

        const data = useManagerSchoolScheduleCalendarData({
            schoolId: () => 'school-1',
            weekStart: ref(new Date(2026, 7, 10)),
            disabled: () => false,
        });

        const firstLoad = data.loadWeek();
        const secondLoad = data.loadWeek();

        await secondLoad;

        expect(data.internalItems.value).toEqual([secondLesson]);

        resolveFirst([firstLesson]);
        await firstLoad;

        expect(data.internalItems.value).toEqual([secondLesson]);
    });

    it('maps request failures to the schedule fallback message', async () => {
        fetchSchoolSchedule.mockRejectedValue(new Error('Network failed'));

        const { useManagerSchoolScheduleCalendarData } =
            await import('./useManagerSchoolScheduleCalendarData');

        const data = useManagerSchoolScheduleCalendarData({
            schoolId: () => 'school-1',
            weekStart: ref(new Date(2026, 7, 10)),
            disabled: () => false,
        });

        await data.loadWeek();

        expect(data.internalItems.value).toEqual([]);
        expect(data.errorMessage.value).toBe('Network failed');
    });
});
