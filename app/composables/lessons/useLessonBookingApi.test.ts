import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readonly, ref } from 'vue';

const requestBffSuccess = vi.fn();

describe('useLessonBookingApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('ref', ref);
        vi.stubGlobal('readonly', readonly);
        vi.stubGlobal('requestBffSuccess', requestBffSuccess);
        vi.stubGlobal('useStudentsApi', () => ({
            fetchList: vi.fn(),
        }));
    });

    it('creates lessons through the success-only BFF helper', async () => {
        requestBffSuccess.mockResolvedValue(undefined);
        const { useLessonBookingApi } = await import('./useLessonBookingApi');
        const api = useLessonBookingApi();

        await expect(
            api.createLesson({
                courseId: ' course-1 ',
                studentId: ' student-user-1 ',
                instructorId: ' instructor-1 ',
                startTime: ' 2026-08-16T08:00:00.000Z ',
                endTime: ' 2026-08-16T09:00:00.000Z ',
                lessonType: 'PRACTICE',
                vehicleId: ' vehicle-1 ',
            }),
        ).resolves.toBeUndefined();

        expect(requestBffSuccess).toHaveBeenCalledWith('POST', '/api/lessons', {
            body: {
                courseId: 'course-1',
                studentId: 'student-user-1',
                instructorId: 'instructor-1',
                startTime: '2026-08-16T08:00:00.000Z',
                endTime: '2026-08-16T09:00:00.000Z',
                lessonType: 'PRACTICE',
                vehicleId: 'vehicle-1',
            },
            fallbackMessage: 'Nie udało się utworzyć rezerwacji.',
        });
        expect(api.modalError.value).toBeNull();
    });
});
