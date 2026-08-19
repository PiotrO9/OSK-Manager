import { describe, expect, it } from 'vitest';
import { parseLessonPatchBody } from './parseLessonPatchBody';

const INSTRUCTOR_ID = '11111111-1111-4111-8111-111111111111';
const VEHICLE_ID = '22222222-2222-4222-8222-222222222222';

describe('parseLessonPatchBody', () => {
    it('accepts empty patch bodies as no-op', () => {
        expect(parseLessonPatchBody(null)).toEqual({ ok: true, body: {} });
        expect(parseLessonPatchBody(undefined)).toEqual({
            ok: true,
            body: {},
        });
    });

    it('trims and returns only supported lesson patch fields', () => {
        expect(
            parseLessonPatchBody({
                instructorId: ` ${INSTRUCTOR_ID} `,
                startTime: ' 2026-08-16T08:00:00.000Z ',
                endTime: ' 2026-08-16T09:00:00.000Z ',
                vehicleId: ` ${VEHICLE_ID} `,
                ignored: 'value',
            }),
        ).toEqual({
            ok: true,
            body: {
                instructorId: INSTRUCTOR_ID,
                startTime: '2026-08-16T08:00:00.000Z',
                endTime: '2026-08-16T09:00:00.000Z',
                vehicleId: VEHICLE_ID,
            },
        });
    });

    it('accepts null vehicle id', () => {
        expect(parseLessonPatchBody({ vehicleId: null })).toEqual({
            ok: true,
            body: { vehicleId: null },
        });
    });

    it('rejects invalid patch values', () => {
        expect(parseLessonPatchBody('unexpected')).toEqual({
            ok: false,
            message: 'Oczekiwano obiektu JSON.',
        });
        expect(parseLessonPatchBody({ instructorId: 'bad-id' })).toEqual({
            ok: false,
            message: 'Pole instructorId musi być poprawnym UUID.',
        });
        expect(parseLessonPatchBody({ startTime: ' ' })).toEqual({
            ok: false,
            message: 'Pole startTime nie może być puste.',
        });
        expect(parseLessonPatchBody({ vehicleId: 'bad-id' })).toEqual({
            ok: false,
            message: 'Pole vehicleId musi być poprawnym UUID lub null.',
        });
    });
});
