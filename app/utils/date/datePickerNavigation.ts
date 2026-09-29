export type DatePickerNavigationMode = 'step' | 'month-year';

export interface DatePickerYearRange {
    start: number;
    end: number;
}

interface ResolveDatePickerYearRangeOptions {
    currentYear: number;
    selectedYear?: number;
    minYear?: number;
    maxYear?: number;
    configuredRange?: DatePickerYearRange;
}

const MIN_CALENDAR_YEAR = 1;
const MAX_CALENDAR_YEAR = 9999;
const DEFAULT_PAST_YEARS = 10;
const DEFAULT_FUTURE_YEARS = 20;

function normalizeYear(value: number | undefined, fallback: number): number {
    const candidate = Number.isFinite(value) ? Math.trunc(value!) : fallback;

    return Math.min(MAX_CALENDAR_YEAR, Math.max(MIN_CALENDAR_YEAR, candidate));
}

export function resolveDatePickerYearRange({
    currentYear,
    selectedYear,
    minYear,
    maxYear,
    configuredRange,
}: ResolveDatePickerYearRangeOptions): DatePickerYearRange {
    const normalizedCurrentYear = normalizeYear(currentYear, 2000);
    const normalizedSelectedYear =
        selectedYear === undefined
            ? undefined
            : normalizeYear(selectedYear, normalizedCurrentYear);
    const anchorYear = normalizedSelectedYear ?? normalizedCurrentYear;
    const lowerLimit = normalizeYear(minYear, MIN_CALENDAR_YEAR);
    const upperLimit = normalizeYear(maxYear, MAX_CALENDAR_YEAR);
    const minLimit = Math.min(lowerLimit, upperLimit);
    const maxLimit = Math.max(lowerLimit, upperLimit);

    const configuredStart = normalizeYear(
        configuredRange?.start,
        anchorYear - DEFAULT_PAST_YEARS,
    );
    const configuredEnd = normalizeYear(
        configuredRange?.end,
        anchorYear + DEFAULT_FUTURE_YEARS,
    );

    let start = Math.min(configuredStart, configuredEnd);
    let end = Math.max(configuredStart, configuredEnd);

    start = Math.max(minLimit, Math.min(start, maxLimit));
    end = Math.max(minLimit, Math.min(end, maxLimit));

    if (
        normalizedSelectedYear !== undefined &&
        normalizedSelectedYear >= minLimit &&
        normalizedSelectedYear <= maxLimit
    ) {
        start = Math.min(start, normalizedSelectedYear);
        end = Math.max(end, normalizedSelectedYear);
    }

    return { start, end };
}

export function createDatePickerYearList(range: DatePickerYearRange): number[] {
    return Array.from(
        { length: range.end - range.start + 1 },
        (_, index) => range.start + index,
    );
}
