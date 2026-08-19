import { describe, expect, it } from 'vitest';
import { parseLessonCreateBody } from './parseLessonCreateBody';

const COURSE_ID = '11111111-1111-4111-8111-111111111111';
const STUDENT_ID = '22222222-2222-4222-8222-222222222222';
const INSTRUCTOR_ID = '33333333-3333-4333-8333-333333333333';
const VEHICLE_ID = '44444444-4444-4444-8444-444444444444';

describe('parseLessonCreateBody', () => {
    it('trims and returns manager lesson create body', () => {
        expect(
            parseLessonCreateBody({
                courseId: ` ${COURSE_ID} `,
                studentId: ` ${STUDENT_ID} `,
                instructorId: ` ${INSTRUCTOR_ID} `,
                startTime: ' 2026-08-16T08:00:00.000Z ',
                endTime: ' 2026-08-16T09:00:00.000Z ',
                lessonType: 'PRACTICE',
                vehicleId: ` ${VEHICLE_ID} `,
            }),
        ).toEqual({
            ok: true,
            body: {
                courseId: COURSE_ID,
                studentId: STUDENT_ID,
                instructorId: INSTRUCTOR_ID,
                startTime: '2026-08-16T08:00:00.000Z',
                endTime: '2026-08-16T09:00:00.000Z',
                lessonType: 'PRACTICE',
                vehicleId: VEHICLE_ID,
            },
        });
    });

    it('keeps existing validation messages for invalid values', () => {
        expect(parseLessonCreateBody(null)).toEqual({
            ok: false,
            message: 'Oczekiwano obiektu JSON.',
        });
        expect(parseLessonCreateBody({ courseId: 'bad-id' })).toEqual({
            ok: false,
            message: 'Pole courseId musi być poprawnym UUID.',
        });
        expect(
            parseLessonCreateBody({
                courseId: COURSE_ID,
                studentId: STUDENT_ID,
                instructorId: INSTRUCTOR_ID,
                startTime: '2026-08-16T08:00:00.000Z',
                endTime: '2026-08-16T09:00:00.000Z',
                lessonType: 'THEORY',
                vehicleId: VEHICLE_ID,
            }),
        ).toEqual({
            ok: false,
            message:
                'Rezerwacja lekcji z slotu dotyczy wyłącznie jazdy praktycznej. Lekcje teoretyczne są grupowe — zaplanuj je w widoku grupy lub wydarzenia THEORY.',
        });
    });
});
