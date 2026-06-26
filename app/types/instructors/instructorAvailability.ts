export interface WeeklyEntry {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

export interface WeeklyDayFormRow {
    dayOfWeek: number;
    label: string;
    enabled: boolean;
    startTime: string;
    endTime: string;
    entryId: string | null;
}

/** Kolejność wyświetlania: poniedziałek → niedziela */
export const WEEK_DAYS_ORDER: number[] = [1, 2, 3, 4, 5, 6, 0];

export const WEEK_DAY_LABELS: Record<number, string> = {
    1: 'Poniedziałek',
    2: 'Wtorek',
    3: 'Środa',
    4: 'Czwartek',
    5: 'Piątek',
    6: 'Sobota',
    0: 'Niedziela',
};

/** Krótkie etykiety (np. podgląd w kartach). */
export const WEEK_DAY_SHORT_LABELS: Record<number, string> = {
    1: 'Pn',
    2: 'Wt',
    3: 'Śr',
    4: 'Cz',
    5: 'Pt',
    6: 'So',
    0: 'Nd',
};

const DEFAULT_START_TIME = '08:00';
const DEFAULT_END_TIME = '16:00';

/** Tworzy 7 pustych wierszy formularza (wszystkie wyłączone). */
export function buildEmptyWeekRows(): WeeklyDayFormRow[] {
    return WEEK_DAYS_ORDER.map((dayOfWeek) => ({
        dayOfWeek,
        label: WEEK_DAY_LABELS[dayOfWeek] ?? String(dayOfWeek),
        enabled: false,
        startTime: '',
        endTime: '',
        entryId: null,
    }));
}

/** Wypełnia wiersze danymi z API. Zwraca nową tablicę 7 wierszy. */
export function mergeWeeklyEntriesToRows(
    entries: WeeklyEntry[],
): WeeklyDayFormRow[] {
    const map = new Map<number, WeeklyEntry>();

    for (const entry of entries) {
        map.set(entry.dayOfWeek, entry);
    }

    return WEEK_DAYS_ORDER.map((dayOfWeek) => {
        const entry = map.get(dayOfWeek);

        if (entry) {
            return {
                dayOfWeek,
                label: WEEK_DAY_LABELS[dayOfWeek] ?? String(dayOfWeek),
                enabled: true,
                startTime: entry.startTime,
                endTime: entry.endTime,
                entryId: entry.id,
            };
        }

        return {
            dayOfWeek,
            label: WEEK_DAY_LABELS[dayOfWeek] ?? String(dayOfWeek),
            enabled: false,
            startTime: DEFAULT_START_TIME,
            endTime: DEFAULT_END_TIME,
            entryId: null,
        };
    });
}
