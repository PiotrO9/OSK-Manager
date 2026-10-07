import { describe, expect, it } from 'vitest';
import { parseLessonPatchBody } from '../../../server/utils/lessons/parseLessonPatchBody';
import {
    areManagerLessonSnapshotsEqual,
    buildManagerLessonPatchPayload,
    managerLessonLocalDatetimeToIso,
    type ManagerLessonEditSnapshot,
} from './useManagerLessonEditForm';

const base: ManagerLessonEditSnapshot = {
    start: '2026-06-26T09:00',
    end: '2026-06-26T10:00',
    vehicle: 'vehicle-1',
    instructorId: 'instructor-1',
};

describe('manager lesson edit form helpers', () => {
    it('detects unchanged snapshots', () => {
        expect(areManagerLessonSnapshotsEqual(base, { ...base })).toBe(true);
        expect(
            areManagerLessonSnapshotsEqual(base, {
                ...base,
                vehicle: 'vehicle-2',
            }),
        ).toBe(false);
    });

    it('builds a minimal patch payload for changed fields', () => {
        const result = buildManagerLessonPatchPayload(base, {
            ...base,
            vehicle: 'vehicle-2',
            instructorId: 'instructor-2',
        });

        expect(result).toEqual({
            ok: true,
            payload: {
                vehicleId: 'vehicle-2',
                instructorId: 'instructor-2',
            },
        });
    });

    it.each([
        {
            name: 'only the start',
            changes: { start: '2026-06-26T09:15' },
            expected: {
                startTime: '2026-06-26T07:15:00.000Z',
                endTime: '2026-06-26T08:00:00.000Z',
            },
        },
        {
            name: 'only the end',
            changes: { end: '2026-06-26T10:30' },
            expected: {
                startTime: '2026-06-26T07:00:00.000Z',
                endTime: '2026-06-26T08:30:00.000Z',
            },
        },
        {
            name: 'both boundaries',
            changes: {
                start: '2026-06-26T09:15',
                end: '2026-06-26T10:30',
            },
            expected: {
                startTime: '2026-06-26T07:15:00.000Z',
                endTime: '2026-06-26T08:30:00.000Z',
            },
        },
    ])(
        'passes both times through the BFF when changing $name',
        ({ changes, expected }) => {
            const result = buildManagerLessonPatchPayload(base, {
                ...base,
                ...changes,
            });

            expect(result).toEqual({ ok: true, payload: expected });

            if (result.ok) {
                expect(parseLessonPatchBody(result.payload)).toEqual({
                    ok: true,
                    body: expected,
                });
            }
        },
    );

    it.each([
        [{ vehicle: 'vehicle-2' }, { vehicleId: 'vehicle-2' }],
        [{ instructorId: 'instructor-2' }, { instructorId: 'instructor-2' }],
    ])('keeps a non-time change minimal', (changes, expected) => {
        expect(
            buildManagerLessonPatchPayload(base, { ...base, ...changes }),
        ).toEqual({
            ok: true,
            payload: expected,
        });
    });

    it('omits times and all other fields when nothing changed', () => {
        expect(buildManagerLessonPatchPayload(base, { ...base })).toEqual({
            ok: true,
            payload: {},
        });
    });

    it('rejects invalid date ranges before creating a patch', () => {
        expect(
            buildManagerLessonPatchPayload(base, {
                ...base,
                start: '2026-06-26T10:00',
                end: '2026-06-26T09:00',
            }),
        ).toEqual({
            ok: false,
            error: 'Koniec musi być później niż początek.',
        });
    });

    it('rejects equal start and end times', () => {
        expect(
            buildManagerLessonPatchPayload(base, {
                ...base,
                end: base.start,
            }),
        ).toEqual({
            ok: false,
            error: 'Koniec musi być później niż początek.',
        });
    });

    it('rejects lesson ranges spanning multiple local days', () => {
        expect(
            buildManagerLessonPatchPayload(base, {
                ...base,
                end: '2026-06-27T10:00',
            }),
        ).toEqual({
            ok: false,
            error: 'Początek i koniec lekcji muszą przypadać tego samego dnia.',
        });
    });

    it('converts Polish wall-clock time to an ISO instant', () => {
        expect(managerLessonLocalDatetimeToIso('2026-06-26T09:00')).toBe(
            '2026-06-26T07:00:00.000Z',
        );
    });

    it('requires vehicle and instructor ids', () => {
        expect(
            buildManagerLessonPatchPayload(base, {
                ...base,
                vehicle: ' ',
            }),
        ).toEqual({ ok: false, error: 'Wybierz pojazd.' });

        expect(
            buildManagerLessonPatchPayload(base, {
                ...base,
                instructorId: ' ',
            }),
        ).toEqual({ ok: false, error: 'Wybierz instruktora.' });
    });
});
