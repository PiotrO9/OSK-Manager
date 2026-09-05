/** Liczba lat doświadczenia z pól API (camelCase / snake_case). */
export function readNumericExperienceYears(
    o: Record<string, unknown>,
): number | null {
    for (const key of ['experienceYears', 'experience_years'] as const) {
        const v = o[key];

        if (v == null) {
            continue;
        }

        if (typeof v === 'number' && Number.isFinite(v)) {
            return v;
        }

        if (typeof v === 'string') {
            const parsed = Number.parseFloat(v.trim());

            if (!Number.isNaN(parsed)) {
                return parsed;
            }
        }
    }

    return null;
}

/** Wyświetlanie „N rok / N lata / N lat” po polsku. */
export function formatPolishExperienceYears(years: number): string {
    const n = Math.floor(years);

    if (n === 1) {
        return '1 rok';
    }

    const mod100 = n % 100;

    if (mod100 >= 11 && mod100 <= 14) {
        return `${n} lat`;
    }

    const mod10 = n % 10;

    if (mod10 === 1) {
        return `${n} rok`;
    }

    if (mod10 >= 2 && mod10 <= 4) {
        return `${n} lata`;
    }

    return `${n} lat`;
}
