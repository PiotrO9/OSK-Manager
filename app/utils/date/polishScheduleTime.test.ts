import { describe, expect, it } from 'vitest';
import {
    isoInstantToPolishDatetimeLocal,
    polishLocalDateTimeToIso,
    polishSlotToIso,
} from './polishScheduleTime';

describe('Polish schedule time', () => {
    it.each([
        ['2026-01-15T10:00', '2026-01-15T09:00:00.000Z'],
        ['2026-07-15T10:00', '2026-07-15T08:00:00.000Z'],
    ])('converts %s in Europe/Warsaw to an instant', (local, expected) => {
        expect(polishLocalDateTimeToIso(local)).toBe(expected);
    });

    it.each(['2026-03-29T02:30', '2026-10-25T02:30'])(
        'rejects nonexistent or ambiguous local time %s',
        (local) => {
            expect(polishLocalDateTimeToIso(local)).toBeNull();
        },
    );

    it('builds a slot instant from separate date and time fields', () => {
        expect(polishSlotToIso('2026-09-24', '10:00')).toBe(
            '2026-09-24T08:00:00.000Z',
        );
    });

    it('formats an instant as a Polish local datetime independently of browser timezone', () => {
        expect(
            isoInstantToPolishDatetimeLocal('2026-09-24T22:30:00.000Z'),
        ).toBe('2026-09-25T00:30');
    });

    it('returns neutral values for invalid inputs', () => {
        expect(polishLocalDateTimeToIso('not-a-date')).toBeNull();
        expect(polishSlotToIso('2026-09-24', '25:00')).toBeNull();
        expect(isoInstantToPolishDatetimeLocal('not-an-instant')).toBe('');
    });
});
