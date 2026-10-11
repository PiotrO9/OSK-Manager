import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readonly, ref } from 'vue';

const requestBffSuccess = vi.fn();
const requestBffData = vi.fn();

describe('useLessonBookingApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('ref', ref);
        vi.stubGlobal('readonly', readonly);
        vi.stubGlobal('requestBffSuccess', requestBffSuccess);
        vi.stubGlobal('requestBffData', requestBffData);
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

    it('keeps all vehicles visible and returns ids available for the slot', async () => {
        const allVehicles = [{ id: 'vehicle-1' }, { id: 'vehicle-2' }];
        const availableVehicles = [{ id: 'vehicle-2' }];

        requestBffData
            .mockResolvedValueOnce(allVehicles)
            .mockResolvedValueOnce(availableVehicles);

        const { useLessonBookingApi } = await import('./useLessonBookingApi');
        const api = useLessonBookingApi();
        const result = await api.loadModalData({
            schoolId: 'school-1',
            date: '2026-08-16',
            startTime: '10:00',
            endTime: '11:00',
            availableInstructors: [],
        });

        expect(result).toEqual({
            students: [],
            totalPages: 0,
            vehicles: allVehicles,
            availableVehicleIds: ['vehicle-2'],
        });
        expect(requestBffData).toHaveBeenCalledTimes(2);
    });

    it('requests booking options for the fixed instructor and supports server search pages', async () => {
        requestBffData.mockResolvedValue({
            items: [],
            total: 0,
            page: 2,
            limit: 20,
            totalPages: 0,
        });
        const { useLessonBookingApi } = await import('./useLessonBookingApi');
        const result = await useLessonBookingApi().fetchBookingOptions(
            {
                schoolId: 'school-1',
                date: '2026-08-16',
                startTime: '10:00',
                endTime: '11:00',
                fixedInstructor: {
                    id: 'instructor-b',
                    firstName: 'Jan',
                    lastName: 'Test',
                },
                availableInstructors: [
                    { id: 'instructor-c', firstName: 'Anna', lastName: 'Test' },
                ],
            },
            ' Nowak ',
            2,
        );

        expect(result.page).toBe(2);
        const path = requestBffData.mock.calls[0]?.[1] as string;
        const params = new URL(path, 'http://localhost').searchParams;

        expect(params.get('instructorIds')).toBe('instructor-b');
        expect(params.get('q')).toBe('Nowak');
        expect(params.get('page')).toBe('2');
    });
});
