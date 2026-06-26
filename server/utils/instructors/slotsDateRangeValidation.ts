const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseLocalDateOnly(dateStr: string): Date | null {
    if (!DATE_RE.test(dateStr)) {
        return null;
    }

    const parts = dateStr.split('-').map(Number);

    if (parts.length < 3) {
        return null;
    }

    const y = parts[0];
    const mo = parts[1];
    const d = parts[2];

    if (
        y === undefined ||
        mo === undefined ||
        d === undefined ||
        !Number.isFinite(y) ||
        !Number.isFinite(mo) ||
        !Number.isFinite(d)
    ) {
        return null;
    }

    const date = new Date(y, mo - 1, d);

    if (
        date.getFullYear() !== y ||
        date.getMonth() !== mo - 1 ||
        date.getDate() !== d
    ) {
        return null;
    }

    return date;
}

export function countInclusiveDays(from: Date, to: Date): number {
    const msPerDay = 86400000;
    const diff = to.getTime() - from.getTime();

    return Math.floor(diff / msPerDay) + 1;
}

/**
 * Wymaga `dateFrom` i `dateTo` w query; waliduje format i max 30 dni włącznie.
 */
export function getValidatedSlotsDateRangeQuery(
    query: Record<string, unknown>,
): {
    dateFromRaw: string;
    dateToRaw: string;
} {
    const dateFromRaw =
        typeof query.dateFrom === 'string' ? query.dateFrom.trim() : '';
    const dateToRaw =
        typeof query.dateTo === 'string' ? query.dateTo.trim() : '';

    if (!dateFromRaw || !dateToRaw) {
        throw createError({
            statusCode: 400,
            message: 'Parametry dateFrom i dateTo są wymagane.',
        });
    }

    const dateFrom = parseLocalDateOnly(dateFromRaw);
    const dateTo = parseLocalDateOnly(dateToRaw);

    if (!dateFrom || !dateTo) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy format daty (oczekiwano YYYY-MM-DD).',
        });
    }

    if (dateFrom > dateTo) {
        throw createError({
            statusCode: 400,
            message: 'dateFrom nie może być późniejsze niż dateTo.',
        });
    }

    const days = countInclusiveDays(dateFrom, dateTo);

    if (days > 30) {
        throw createError({
            statusCode: 400,
            message: 'Zakres dat nie może przekraczać 30 dni.',
        });
    }

    return { dateFromRaw, dateToRaw };
}

/**
 * Serializuje query do przekazania upstream (np. sloty OSK z dodatkowymi filtrami).
 */
export function buildQueryStringFromGetQuery(
    query: Record<string, unknown>,
): string {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) {
            continue;
        }

        if (Array.isArray(value)) {
            for (const v of value) {
                if (typeof v === 'string') {
                    params.append(key, v);
                }
            }

            continue;
        }

        if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean'
        ) {
            params.append(key, String(value));
        }
    }

    return params.toString();
}
