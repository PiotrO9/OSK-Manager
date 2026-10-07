import { describe, expect, it } from 'vitest';
import { filterMockRatingsByDate } from './mockRatingDateFilters';

const now = new Date('2026-01-01T12:00:00.000Z');
const ratings = [
    { id: 'before-month', createdAt: '2025-12-01T23:59:59.999Z' },
    { id: 'month-start', createdAt: '2025-12-02T00:00:00.000Z' },
    { id: 'before-week', createdAt: '2025-12-25T23:59:59.999Z' },
    { id: 'week-start', createdAt: '2025-12-26T00:00:00.000Z' },
    { id: 'yesterday', createdAt: '2025-12-31T23:59:59.999Z' },
    { id: 'today', createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'tomorrow', createdAt: '2026-01-02T00:00:00.000Z' },
];

function ids(options: { period?: string; dateFrom?: string; dateTo?: string }) {
    return filterMockRatingsByDate(ratings, options, now).map(
        (item) => item.id,
    );
}

describe('filterMockRatingsByDate', () => {
    it('includes today and six previous UTC days, excluding the next day', () => {
        expect(ids({ period: 'last7days' })).toEqual([
            'week-start',
            'yesterday',
            'today',
        ]);
    });

    it('uses yesterday and inclusive explicit dates across the year boundary', () => {
        expect(ids({ period: 'yesterday' })).toEqual(['yesterday']);
        expect(
            ids({
                period: 'last7days',
                dateFrom: '2025-12-31',
                dateTo: '2025-12-31',
            }),
        ).toEqual(['yesterday']);
    });

    it('keeps last30days at 30 previous days plus today', () => {
        expect(ids({ period: 'last30days' })).toEqual([
            'month-start',
            'before-week',
            'week-start',
            'yesterday',
            'today',
        ]);
        expect(ids({ period: 'all' })).toHaveLength(7);
    });
});
