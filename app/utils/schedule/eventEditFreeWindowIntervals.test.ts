import { describe, expect, it } from 'vitest';
import type { FreeWindow } from '~/types/events/instructorEvent';
import {
    getContainingWindowBoundsMs,
    getLocalDayIntersections,
    intersectWindowWithLocalDay,
    localDayBounds,
    localMinuteIsInIntervals,
    msToDatetimeLocalString,
    parseLocalDayParts,
    startLocalToMs,
} from './eventEditFreeWindowIntervals';

const window = (overrides: Partial<FreeWindow> = {}): FreeWindow => ({
    startTime: '2026-09-12T08:00:00',
    endTime: '2026-09-12T10:00:00',
    ...overrides,
});

describe('event edit free window interval utilities', () => {
    it('parses local day strings and rejects invalid formats', () => {
        expect(parseLocalDayParts('2026-09-12')).toEqual({
            y: 2026,
            mo: 9,
            d: 12,
        });
        expect(parseLocalDayParts(' 2026-09-12 ')).toEqual({
            y: 2026,
            mo: 9,
            d: 12,
        });
        expect(parseLocalDayParts('2026-9-12')).toBeNull();
        expect(parseLocalDayParts('bad')).toBeNull();
    });

    it('builds local day bounds', () => {
        const bounds = localDayBounds('2026-09-12');

        expect(bounds?.start.getFullYear()).toBe(2026);
        expect(bounds?.start.getMonth()).toBe(8);
        expect(bounds?.start.getDate()).toBe(12);
        expect(bounds?.start.getHours()).toBe(0);
        expect(bounds?.end.getHours()).toBe(23);
        expect(bounds?.end.getMinutes()).toBe(59);
    });

    it('intersects windows with a local calendar day', () => {
        const intersection = intersectWindowWithLocalDay(
            window({
                startTime: '2026-09-11T22:00:00',
                endTime: '2026-09-12T10:00:00',
            }),
            '2026-09-12',
        );

        expect(intersection).not.toBeNull();
        expect(intersection?.start.getDate()).toBe(12);
        expect(
            intersectWindowWithLocalDay(
                window({
                    startTime: '2026-09-10T08:00:00',
                    endTime: '2026-09-10T10:00:00',
                }),
                '2026-09-12',
            ),
        ).toBeNull();
    });

    it('returns all local day intersections and checks minute membership', () => {
        const intervals = getLocalDayIntersections(
            [
                window(),
                window({
                    startTime: '2026-09-13T08:00:00',
                    endTime: '2026-09-13T10:00:00',
                }),
            ],
            '2026-09-12',
        );

        expect(intervals).toHaveLength(1);
        expect(localMinuteIsInIntervals(2026, 9, 12, 9, 0, intervals)).toBe(
            true,
        );
        expect(localMinuteIsInIntervals(2026, 9, 12, 11, 0, intervals)).toBe(
            false,
        );
    });

    it('finds containing window bounds for an instant', () => {
        const instant = new Date('2026-09-12T09:00:00').getTime();

        expect(getContainingWindowBoundsMs([window()], instant)).toEqual({
            ws: new Date('2026-09-12T08:00:00').getTime(),
            we: new Date('2026-09-12T10:00:00').getTime(),
        });
        expect(
            getContainingWindowBoundsMs(
                [window()],
                new Date('2026-09-12T11:00:00').getTime(),
            ),
        ).toBeNull();
    });

    it('converts between local datetime strings and milliseconds', () => {
        const ms = startLocalToMs('2026-09-12T09:05');

        expect(ms).not.toBeNull();
        expect(msToDatetimeLocalString(ms!)).toBe('2026-09-12T09:05');
        expect(startLocalToMs('invalid')).toBeNull();
    });
});
