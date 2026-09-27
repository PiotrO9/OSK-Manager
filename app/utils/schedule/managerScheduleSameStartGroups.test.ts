import { describe, expect, it } from 'vitest';
import type { ScheduleLessonItem } from '~/types/schedule/schedule';
import {
    buildScheduleSameStartGroups,
    formatScheduleSameStartGroupLabel,
} from './managerScheduleSameStartGroups';

function lesson(
    id: string,
    startTime: string,
    endTime: string,
    type = 'PRACTICE',
): ScheduleLessonItem {
    return {
        id,
        kind: 'lesson',
        type,
        status: 'SCHEDULED',
        startTime,
        endTime,
    };
}

describe('schedule groups with the same start minute', () => {
    it('keeps single lessons separate and groups only starts in the same minute', () => {
        const first = lesson('a', '2026-09-21T09:00:00', '2026-09-21T10:00:00');
        const second = lesson(
            'b',
            '2026-09-21T09:00:30',
            '2026-09-21T10:30:00',
        );
        const later = lesson('c', '2026-09-21T09:30:00', '2026-09-21T10:30:00');

        const groups = buildScheduleSameStartGroups([later, second, first]);

        expect(
            groups.map((group) => group.items.map((item) => item.id)),
        ).toEqual([['a', 'b'], ['c']]);
        expect(groups[0]?.topPx).toBe(120);
        expect(groups[0]?.heightPx).toBe(28);
        expect(groups[0]?.commonEndHm).toBeNull();
    });

    it('leaves a visible gap before the next start even when lessons run longer', () => {
        const groups = buildScheduleSameStartGroups([
            lesson('a', '2026-09-21T09:00:00', '2026-09-21T11:00:00'),
            lesson('b', '2026-09-21T09:00:00', '2026-09-21T10:30:00'),
            lesson('c', '2026-09-21T10:00:00', '2026-09-21T11:30:00'),
            lesson('d', '2026-09-21T10:00:00', '2026-09-21T11:00:00'),
        ]);

        expect(groups[0]?.topPx).toBe(120);
        expect(groups[0]?.heightPx).toBe(58);
        expect(groups[1]?.topPx).toBe(180);
        expect(groups[0]!.topPx + groups[0]!.heightPx).toBeLessThan(
            groups[1]!.topPx,
        );
        expect(groups[0]?.items[0]?.endTime).toBe('2026-09-21T11:00:00');
    });

    it('keeps a single lesson at its true duration when a later lesson overlaps it', () => {
        const groups = buildScheduleSameStartGroups([
            lesson('later', '2026-09-21T16:00:00', '2026-09-21T17:30:00'),
            lesson('earlier', '2026-09-21T15:00:00', '2026-09-21T16:30:00'),
        ]);

        expect(groups.map((group) => group.topPx)).toEqual([480, 540]);
        expect(groups.map((group) => group.heightPx)).toEqual([89, 89]);
        expect(groups[0]!.topPx + groups[0]!.heightPx).toBeGreaterThan(
            groups[1]!.topPx,
        );
    });

    it('shows a time range only when every lesson ends together', () => {
        const groups = buildScheduleSameStartGroups([
            lesson('a', '2026-09-21T09:00:00', '2026-09-21T10:00:00'),
            lesson('b', '2026-09-21T09:00:00', '2026-09-21T10:00:00'),
        ]);

        expect(groups[0]?.commonEndHm).toBe('10:00');
        expect(formatScheduleSameStartGroupLabel(groups[0]!)).toBe(
            '09:00–10:00 · 2 jazdy',
        );
    });

    it('labels mixed starts without calling them all driving lessons', () => {
        const groups = buildScheduleSameStartGroups([
            lesson('a', '2026-09-21T09:00:00', '2026-09-21T10:00:00'),
            lesson('b', '2026-09-21T09:00:00', '2026-09-21T10:45:00', 'THEORY'),
        ]);

        expect(formatScheduleSameStartGroupLabel(groups[0]!)).toBe(
            '09:00 · 2 zajęcia',
        );
    });

    it('uses the plural form for five concurrent driving lessons', () => {
        const groups = buildScheduleSameStartGroups(
            ['a', 'b', 'c', 'd', 'e'].map((id) =>
                lesson(id, '2026-09-21T09:00:00', '2026-09-21T10:00:00'),
            ),
        );

        expect(formatScheduleSameStartGroupLabel(groups[0]!)).toBe(
            '09:00–10:00 · 5 jazd',
        );
    });
});
