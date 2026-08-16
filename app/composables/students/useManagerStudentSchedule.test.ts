import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import type { StudentDetail } from '~/types/students/student';

const fetchScheduleForStudent = vi.fn();

function installNuxtStudentScheduleGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('useScheduleApi', () => ({
        fetchScheduleForStudent,
    }));
}

function student(): StudentDetail {
    return {
        id: 'student-profile-1',
        userId: 'student-user-1',
        firstName: 'Anna',
        lastName: 'Nowak',
        email: 'anna@example.com',
        pkkNumber: null,
        notes: null,
        courses: [],
    };
}

describe('useManagerStudentSchedule', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        installNuxtStudentScheduleGlobals();
    });

    it('skips loading schedule without student or school id', async () => {
        const { useManagerStudentSchedule } =
            await import('./useManagerStudentSchedule');
        const schedule = useManagerStudentSchedule({
            student: ref(null),
            schoolId: ref('school-1'),
        });

        await schedule.loadStudentSchedule();

        expect(schedule.scheduleItems.value).toEqual([]);
        expect(schedule.scheduleLoading.value).toBe(false);
        expect(fetchScheduleForStudent).not.toHaveBeenCalled();
    });

    it('loads schedule for current week range and exposes overview label', async () => {
        fetchScheduleForStudent.mockResolvedValue([
            {
                id: 'lesson-1',
                kind: 'booked-practical-lesson',
            },
        ]);
        const { useManagerStudentSchedule } =
            await import('./useManagerStudentSchedule');
        const schedule = useManagerStudentSchedule({
            student: ref(student()),
            schoolId: ref('school-1'),
        });

        await schedule.loadStudentSchedule();

        expect(fetchScheduleForStudent).toHaveBeenCalledWith(
            'student-profile-1',
            schedule.studentScheduleRange.value.dateFrom,
            schedule.studentScheduleRange.value.dateTo,
            'school-1',
        );
        expect(schedule.scheduleItems.value).toHaveLength(1);
        expect(schedule.scheduleOverviewLabel.value).toBe('1');
    });
});
