import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref, shallowRef, watch } from 'vue';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';

function installNuxtSchoolScheduleCalendarGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('shallowRef', shallowRef);
    vi.stubGlobal('watch', watch);
    vi.stubGlobal('useSchoolScheduleApi', () => ({
        fetchSchoolSchedule: vi.fn(),
        isLoading: ref(false),
    }));
    vi.stubGlobal('navigateTo', vi.fn());
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

describe('useManagerSchoolScheduleCalendar', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        installNuxtSchoolScheduleCalendarGlobals();
    });

    it('groups parent schedule items by date and stacks same-start lessons deterministically', async () => {
        const later = scheduleLesson({
            id: 'later',
            startTime: '2026-08-10T11:00:00',
            endTime: '2026-08-10T12:00:00',
        });
        const sameStartSecond = scheduleLesson({
            id: 'b-same-start',
            startTime: '2026-08-10T09:00:00',
            endTime: '2026-08-10T10:30:00',
        });
        const sameStartFirst = scheduleLesson({
            id: 'a-same-start',
            startTime: '2026-08-10T09:00:00',
            endTime: '2026-08-10T10:00:00',
        });

        const { useManagerSchoolScheduleCalendar } =
            await import('./useManagerSchoolScheduleCalendar');

        const calendar = useManagerSchoolScheduleCalendar(
            {
                schoolId: 'school-1',
                eventEditEnabled: false,
                parentSchedule: true,
                parentItems: [later, sameStartSecond, sameStartFirst],
                parentLoading: false,
                parentError: null,
                weekStart: new Date(2026, 7, 10),
                scheduleCountBadgeLabel: 'lekcje',
                emptyDayMessage: 'Brak zajęć.',
                practicePrimaryLine: 'student',
                studentRatingSelectionEnabled: false,
            },
            vi.fn(),
        );

        expect(calendar.lessonsForDate('2026-08-10')).toEqual([
            sameStartSecond,
            sameStartFirst,
            later,
        ]);
        expect(calendar.lessonBlockHeightPx(sameStartFirst, '2026-08-10')).toBe(
            43.5,
        );
        expect(calendar.lessonBlockTopPx(sameStartFirst, '2026-08-10')).toBe(
            120,
        );
        expect(calendar.lessonBlockTopPx(sameStartSecond, '2026-08-10')).toBe(
            165.5,
        );
    });
});
