import { describe, expect, it } from 'vitest';
import { buildScheduleSameStartGroups } from '~/utils/schedule/managerScheduleSameStartGroups';
import { isoInstantToPolishDatetimeLocal } from '~/utils/date/polishScheduleTime';
import { buildDesignSystemScheduleItems } from './scheduleDemo';

function polishDateTime(iso: string): string {
    return isoInstantToPolishDatetimeLocal(iso);
}

describe('design system schedule demo', () => {
    it('shows the actual grouping and overlap cases in the sample week', () => {
        const items = buildDesignSystemScheduleItems(new Date(2026, 8, 21));
        const monday = items.filter((item) =>
            polishDateTime(item.startTime).startsWith('2026-09-21'),
        );
        const friday = items.filter((item) =>
            polishDateTime(item.startTime).startsWith('2026-09-25'),
        );

        expect(items).toHaveLength(13);
        expect(
            buildScheduleSameStartGroups(monday).find(
                (group) => group.items.length === 3,
            )?.items,
        ).toHaveLength(3);
        expect(friday.map((item) => polishDateTime(item.startTime))).toEqual([
            '2026-09-25T15:00',
            '2026-09-25T16:00',
        ]);
    });

    it('moves all demo items with the selected week, including after DST', () => {
        const items = buildDesignSystemScheduleItems(new Date(2026, 9, 26));

        expect(items).toHaveLength(13);
        expect(polishDateTime(items[0]!.startTime)).toBe('2026-10-26T08:00');
        expect(polishDateTime(items.at(-1)!.startTime)).toBe(
            '2026-10-30T16:00',
        );
    });
});
