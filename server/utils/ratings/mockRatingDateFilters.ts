interface MockRatingDateQuery {
    period?: string;
    dateFrom?: string;
    dateTo?: string;
}

function utcDayStart(date: Date): Date {
    return new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date);

    result.setUTCDate(result.getUTCDate() + days);

    return result;
}

export function filterMockRatingsByDate<T extends { createdAt: string }>(
    ratings: T[],
    query: MockRatingDateQuery,
    now: Date,
): T[] {
    let start: Date;
    let end: Date;

    if (query.dateFrom && query.dateTo) {
        start = new Date(`${query.dateFrom}T00:00:00.000Z`);
        end = addDays(new Date(`${query.dateTo}T00:00:00.000Z`), 1);
    } else {
        const today = utcDayStart(now);

        if (query.period === 'yesterday') {
            start = addDays(today, -1);
            end = today;
        } else if (query.period === 'last7days') {
            start = addDays(today, -6);
            end = addDays(today, 1);
        } else if (query.period === 'last30days') {
            start = addDays(today, -30);
            end = addDays(today, 1);
        } else {
            return ratings;
        }
    }

    return ratings.filter((rating) => {
        const createdAt = new Date(rating.createdAt);

        return createdAt >= start && createdAt < end;
    });
}
