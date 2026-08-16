import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import type { InstructorListItem } from '~/types/instructors/instructor';

const fetchSchoolSchedule = vi.fn();
const fetchMySchedule = vi.fn();
const fetchInstructorsList = vi.fn();

function installNuxtEventsDayGlobals(sessionValue: {
    role?: string;
    defaultOskId?: string | null;
}): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('watch', vi.fn());
    vi.stubGlobal('onMounted', vi.fn());
    vi.stubGlobal('onBeforeUnmount', vi.fn());
    vi.stubGlobal('useAuthSession', () => ({ session: ref(sessionValue) }));
    vi.stubGlobal('useSchoolScheduleApi', () => ({
        fetchSchoolSchedule,
        isLoading: ref(false),
    }));
    vi.stubGlobal('useScheduleApi', () => ({ fetchMySchedule }));
    vi.stubGlobal('useInstructorsApi', () => ({
        fetchList: fetchInstructorsList,
        isListLoading: ref(false),
    }));
}

function scheduleEvent(
    overrides: Partial<ScheduleLessonItem> = {},
): ScheduleLessonItem {
    return {
        id: 'event-1',
        kind: 'instructor_event',
        type: 'DRIVE',
        status: 'PLANNED',
        startTime: '2026-08-16T08:00:00',
        endTime: '2026-08-16T09:00:00',
        instructor: {
            id: 'user-1',
            firstName: 'Anna',
            lastName: 'Nowak',
        },
        participantCount: 1,
        capacity: 2,
        ...overrides,
    };
}

function instructor(
    overrides: Partial<InstructorListItem> = {},
): InstructorListItem {
    return {
        id: 'instructor-1',
        userId: 'user-1',
        firstName: 'Anna',
        lastName: 'Nowak',
        email: 'anna@example.com',
        ...overrides,
    };
}

describe('useEventsDayPage', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it('loads manager day events and preserves the grid contract', async () => {
        const event = scheduleEvent();
        const filteredLesson = scheduleEvent({
            id: 'lesson-1',
            kind: 'lesson',
            instructor: {
                id: 'user-1',
                firstName: 'Anna',
                lastName: 'Nowak',
            },
        });

        fetchSchoolSchedule.mockResolvedValue([filteredLesson, event]);
        fetchInstructorsList.mockResolvedValue([
            instructor(),
            instructor({
                id: 'instructor-2',
                userId: 'user-2',
                firstName: 'Piotr',
                lastName: 'Kowalski',
                email: 'piotr@example.com',
            }),
        ]);
        installNuxtEventsDayGlobals({
            role: 'MANAGER',
            defaultOskId: 'school-1',
        });

        const { useEventsDayPage } = await import('./useEventsDayPage');
        const page = useEventsDayPage();

        page.selectedDate.value = '2026-08-16';
        await page.loadEvents();

        expect(fetchSchoolSchedule).toHaveBeenCalledWith(
            'school-1',
            '2026-08-16',
            '2026-08-16',
        );
        expect(fetchInstructorsList).toHaveBeenCalledWith('school-1');
        expect(fetchMySchedule).not.toHaveBeenCalled();
        expect(page.events.value).toEqual([event]);
        expect(
            page.managerScheduleColumns.value.map((column) => column.id),
        ).toEqual(['user-1', 'user-2']);

        const eventRow = page.managerScheduleRows.value.find(
            (row) => row.hour === 8,
        );
        const eventCell = eventRow?.cells.find(
            (cell) => cell.columnId === 'user-1',
        );

        expect(eventCell?.events).toEqual([event]);
    });
});
