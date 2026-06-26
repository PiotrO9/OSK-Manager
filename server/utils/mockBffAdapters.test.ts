import { describe, expect, it } from 'vitest';
import { bffMockEventsPost } from './eventsMockBff';
import { bffMockLessonsPost } from './lessonsMockBff';
import { bffMockStudentPaymentsList } from './studentsMockBff';
import { bffMockVehiclesList } from './vehiclesMockBff';

describe('mock BFF adapters', () => {
    it('returns vehicle lists in the BFF success envelope', () => {
        expect(bffMockVehiclesList('school-1')).toMatchObject({
            success: true,
            data: expect.any(Array),
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
