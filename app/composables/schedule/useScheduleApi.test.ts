import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';

const requestBffData = vi.fn();

const lesson: ScheduleLessonItem = {
    id: 'lesson-1',
    kind: 'lesson',
    type: 'PRACTICE',
    status: 'SCHEDULED',
    startTime: '2026-08-10T08:00:00.000Z',
    endTime: '2026-08-10T09:00:00.000Z',
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
};

function installScheduleApiGlobals(): void {
    vi.stubGlobal('requestBffData', requestBffData);
}

describe('useScheduleApi', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        installScheduleApiGlobals();
        requestBffData.mockImplementation(
            async (_method: string, _path: string, options: unknown) => {
                const normalize = (
                    options as {
                        normalize: (data: unknown) => ScheduleLessonItem[];
                    }
                ).normalize;

                return normalize({ items: [lesson] });
            },
        );
    });

    it('maps schedule items from the BFF envelope for current user schedule', async () => {
        const { useScheduleApi } = await import('./useScheduleApi');
        const api = useScheduleApi();

        await expect(
            api.fetchMySchedule(' 2026-08-10 ', ' 2026-08-16 '),
        ).resolves.toEqual([lesson]);

        expect(requestBffData).toHaveBeenCalledWith(
            'GET',
            '/api/schedule/me?dateFrom=2026-08-10&dateTo=2026-08-16',
            expect.objectContaining({
                fallbackMessage: 'Nie udało się pobrać harmonogramu.',
            }),
        );
    });

    it('builds manager schedule paths for instructor and student targets', async () => {
        const { useScheduleApi } = await import('./useScheduleApi');
        const api = useScheduleApi();

        await api.fetchScheduleForInstructor(
            ' instructor-1 ',
            '2026-08-10',
            '2026-08-16',
        );
        await api.fetchScheduleForStudent(
            ' student-1 ',
            '2026-08-10',
            '2026-08-16',
            ' school-1 ',
        );

        expect(requestBffData).toHaveBeenNthCalledWith(
            1,
            'GET',
            '/api/schedule?dateFrom=2026-08-10&dateTo=2026-08-16&instructorId=instructor-1',
            expect.any(Object),
        );
        expect(requestBffData).toHaveBeenNthCalledWith(
            2,
            'GET',
            '/api/schedule?dateFrom=2026-08-10&dateTo=2026-08-16&studentId=student-1&schoolId=school-1',
            expect.any(Object),
        );
    });

    it('skips schedule requests when required identifiers are missing', async () => {
        const { useScheduleApi } = await import('./useScheduleApi');
        const api = useScheduleApi();

        await expect(api.fetchMySchedule('', '2026-08-16')).resolves.toEqual(
            [],
        );
        await expect(
            api.fetchScheduleForInstructor('', '2026-08-10', '2026-08-16'),
        ).resolves.toEqual([]);
        await expect(
            api.fetchScheduleForStudent(
                'student-1',
                '2026-08-10',
                '2026-08-16',
                '',
            ),
        ).resolves.toEqual([]);

        expect(requestBffData).not.toHaveBeenCalled();
    });
});
