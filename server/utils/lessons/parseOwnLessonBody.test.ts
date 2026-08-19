import { describe, expect, it } from 'vitest';
import { parseOwnLessonBody } from './parseOwnLessonBody';

const COURSE_ID = '11111111-1111-4111-8111-111111111111';
const INSTRUCTOR_ID = '22222222-2222-4222-8222-222222222222';

describe('parseOwnLessonBody', () => {
    it('trims and returns own lesson create body', () => {
        expect(
            parseOwnLessonBody({
                courseId: ` ${COURSE_ID} `,
                instructorId: ` ${INSTRUCTOR_ID} `,
                startTime: ' 2026-08-16T08:00:00.000Z ',
                endTime: ' 2026-08-16T09:00:00.000Z ',
            }),
        ).toEqual({
            ok: true,
            body: {
                courseId: COURSE_ID,
                instructorId: INSTRUCTOR_ID,
                startTime: '2026-08-16T08:00:00.000Z',
                endTime: '2026-08-16T09:00:00.000Z',
            },
        });
    });

    it('rejects unsupported fields and invalid ids', () => {
        expect(parseOwnLessonBody(null)).toEqual({
            ok: false,
            message: 'Oczekiwano obiektu JSON.',
        });
        expect(parseOwnLessonBody({ extra: true })).toEqual({
            ok: false,
            message: 'Pole extra nie jest dozwolone dla rezerwacji kursanta.',
        });
        expect(
            parseOwnLessonBody({
                courseId: 'bad-id',
                instructorId: INSTRUCTOR_ID,
                startTime: '2026-08-16T08:00:00.000Z',
                endTime: '2026-08-16T09:00:00.000Z',
            }),
        ).toEqual({
            ok: false,
            message: 'Pole courseId musi byc poprawnym UUID.',
        });
    });

    it('rejects invalid time ranges', () => {
        expect(
            parseOwnLessonBody({
                courseId: COURSE_ID,
                instructorId: INSTRUCTOR_ID,
                startTime: 'not-a-date',
                endTime: '2026-08-16T09:00:00.000Z',
            }),
        ).toEqual({
            ok: false,
            message: 'Pola startTime i endTime sa wymagane w formacie ISO.',
        });
        expect(
            parseOwnLessonBody({
                courseId: COURSE_ID,
                instructorId: INSTRUCTOR_ID,
                startTime: '2026-08-16T09:00:00.000Z',
                endTime: '2026-08-16T08:00:00.000Z',
            }),
        ).toEqual({
            ok: false,
            message: 'startTime musi byc przed endTime.',
        });
    });
});
