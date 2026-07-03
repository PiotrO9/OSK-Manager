import { describe, expect, it } from 'vitest';
import { bffMockEventsPost } from '~~/server/utils/events/eventsMockBff';
import { bffMockLessonsPost } from '~~/server/utils/lessons/lessonsMockBff';
import { bffMockStudentPaymentsList } from '~~/server/utils/students/studentsMockBff';
import {
    bffMockVehiclesList,
    bffMockVehiclesUpdateStatus,
} from '~~/server/utils/vehicles/vehiclesMockBff';

describe('mock BFF adapters', () => {
    it('returns vehicle lists in the BFF success envelope', () => {
        expect(bffMockVehiclesList('school-1')).toMatchObject({
            success: true,
            data: expect.any(Array),
        });
    });

    it('returns temporary vehicle unavailability from the mock BFF', () => {
        const vehicle = (
            bffMockVehiclesList('school-temp').data as Array<{ id: string }>
        )[0];

        expect(
            bffMockVehiclesUpdateStatus(vehicle.id, {
                status: 'UNAVAILABLE',
                unavailableUntil: '2026-07-10',
            }),
        ).toMatchObject({
            success: true,
            data: {
                status: 'UNAVAILABLE',
                unavailableUntil: '2026-07-10',
            },
        });
    });

    it('returns student payments in the BFF success envelope', () => {
        expect(bffMockStudentPaymentsList()).toMatchObject({
            success: true,
            data: {
                payments: expect.any(Array),
            },
        });
    });

    it('creates mock lesson payloads in the BFF success envelope', () => {
        expect(
            bffMockLessonsPost({
                courseId: 'course-1',
                studentId: 'student-1',
                instructorId: 'instructor-1',
                vehicleId: 'vehicle-1',
                lessonType: 'PRACTICE',
                startTime: '2026-06-26T09:00:00.000Z',
                endTime: '2026-06-26T10:00:00.000Z',
            }),
        ).toMatchObject({
            success: true,
            data: {
                lesson: {
                    instructorId: 'instructor-1',
                    vehicleId: 'vehicle-1',
                    lessonType: 'PRACTICE',
                    status: 'SCHEDULED',
                },
            },
        });
    });

    it('creates mock event payloads in the BFF success envelope', () => {
        expect(
            bffMockEventsPost({
                instructorId: 'instructor-1',
                type: 'DRIVE',
                startTime: '2026-06-26T09:00:00.000Z',
                endTime: '2026-06-26T10:00:00.000Z',
                vehicleId: 'vehicle-1',
            }),
        ).toMatchObject({
            success: true,
            data: {
                event: {
                    instructorId: 'instructor-1',
                    type: 'DRIVE',
                    vehicleId: 'vehicle-1',
                },
            },
        });
    });
});
