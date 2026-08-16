import { describe, expect, it } from 'vitest';
import { parseEventPatchBody } from './parseEventPatchBody';

const INSTRUCTOR_ID = '11111111-1111-4111-8111-111111111111';
const VEHICLE_ID = '22222222-2222-4222-8222-222222222222';

describe('parseEventPatchBody', () => {
    it('accepts empty event patch bodies as no-op', () => {
        expect(parseEventPatchBody(null)).toEqual({ ok: true, body: {} });
        expect(parseEventPatchBody(undefined)).toEqual({
            ok: true,
            body: {},
        });
    });

    it('trims and returns supported event patch fields', () => {
        expect(
            parseEventPatchBody({
                instructorId: ` ${INSTRUCTOR_ID} `,
                type: 'DRIVE',
                startTime: ' 2026-08-16T08:00:00.000Z ',
                endTime: ' 2026-08-16T09:00:00.000Z ',
                vehicleId: ` ${VEHICLE_ID} `,
                capacity: '3',
                status: 'DONE',
                ignored: true,
            }),
        ).toEqual({
            ok: true,
            body: {
                instructorId: INSTRUCTOR_ID,
                type: 'DRIVE',
                startTime: '2026-08-16T08:00:00.000Z',
                endTime: '2026-08-16T09:00:00.000Z',
                vehicleId: VEHICLE_ID,
                capacity: 3,
                status: 'DONE',
            },
        });
    });

    it('accepts nullable vehicle and capacity patches', () => {
        expect(
            parseEventPatchBody({
                type: 'THEORY',
                vehicleId: null,
                capacity: null,
            }),
        ).toEqual({
            ok: true,
            body: {
                type: 'THEORY',
                vehicleId: null,
                capacity: null,
            },
        });
    });

    it('rejects invalid event patch values', () => {
        expect(parseEventPatchBody('unexpected')).toEqual({
            ok: false,
            message: 'Oczekiwano obiektu JSON.',
        });
        expect(parseEventPatchBody({ type: 'OTHER' })).toEqual({
            ok: false,
            message: 'Pole type musi być DRIVE lub THEORY.',
        });
        expect(parseEventPatchBody({ capacity: -1 })).toEqual({
            ok: false,
            message:
                'Pole capacity musi być nieujemną liczbą całkowitą, null lub puste.',
        });
        expect(parseEventPatchBody({ status: 'OTHER' })).toEqual({
            ok: false,
            message:
                'Pole status musi być PLANNED, DONE, NO_SHOW lub CANCELLED.',
        });
    });
});
