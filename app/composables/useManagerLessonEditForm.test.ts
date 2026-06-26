import { describe, expect, it } from 'vitest';
import {
    areManagerLessonSnapshotsEqual,
    buildManagerLessonPatchPayload,
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
