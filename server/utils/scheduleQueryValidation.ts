import { isUuid } from '~~/server/utils/parseVehicleRequestBody';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseYyyyMmDd(raw: unknown): string {
    if (typeof raw !== 'string') {
        return '';
    }

    const s = raw.trim();

    if (!DATE_RE.test(s)) {
        return '';
    }

    return s;
}

/**
 * Walidacja query jak w BE scheduleMeQuerySchema.
 */
export function parseScheduleMeQuery(query: Record<string, unknown>): {
    dateFrom: string;
    dateTo: string;
} {
    const dateFrom = parseYyyyMmDd(query.dateFrom);
    const dateTo = parseYyyyMmDd(query.dateTo);

    if (!dateFrom) {
        throw createError({
            statusCode: 400,
            message: 'Parametr dateFrom jest wymagany (YYYY-MM-DD).',
        });
    }

    if (!dateTo) {
        throw createError({
            statusCode: 400,
            message: 'Parametr dateTo jest wymagany (YYYY-MM-DD).',
        });
    }

    if (dateFrom > dateTo) {
        throw createError({
            statusCode: 400,
            message: 'dateFrom nie może być późniejsze niż dateTo.',
        });
    }

    return { dateFrom, dateTo };
}

/**
 * Walidacja query jak w BE scheduleQuerySchema (MANAGER): dokładnie jeden z instructorId / studentId.
 */
export function parseScheduleManagerQuery(query: Record<string, unknown>): {
    dateFrom: string;
    dateTo: string;
    instructorId?: string;
    studentId?: string;
} {
    const base = parseScheduleMeQuery(query);

    const instructorRaw = query.instructorId;
    const studentRaw = query.studentId;

    const instructorId =
        typeof instructorRaw === 'string' && instructorRaw.trim().length > 0
            ? instructorRaw.trim()
            : undefined;
    const studentId =
        typeof studentRaw === 'string' && studentRaw.trim().length > 0
            ? studentRaw.trim()
            : undefined;

    const hasI = instructorId !== undefined;
    const hasS = studentId !== undefined;

    if (hasI === hasS) {
        throw createError({
            statusCode: 400,
            message:
                'Podaj dokładnie jeden parametr: instructorId albo studentId.',
        });
    }

    if (instructorId !== undefined && !isUuid(instructorId)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator instructorId.',
        });
    }

    if (studentId !== undefined && !isUuid(studentId)) {
        throw createError({
            statusCode: 400,
            message: 'Nieprawidłowy identyfikator studentId.',
        });
    }

    if (instructorId !== undefined) {
        return { ...base, instructorId };
    }

    return { ...base, studentId: studentId! };
}
