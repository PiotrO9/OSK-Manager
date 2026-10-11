import { isUuid } from '~~/server/utils/validation/requestValidation';
import { z } from 'zod';

const coursePatchRecordSchema = z.custom<Record<string, unknown>>(
    (value) => value !== null && typeof value === 'object',
);

export interface BffCoursePatchInstructorBody {
    instructorId?: string | null;
    name?: string;
    category?: string;
    kind?: 'THEORY_GROUP' | 'PRACTICAL' | 'EXTRA';
    totalHours?: number;
    capacity?: number | null;
    theoryStartDate?: string | null;
    theoryEndDate?: string | null;
}

/**
 * Parsuje częściową aktualizację kursu, zachowując obsługę starego PATCH instruktora.
 */
export function parseCoursePatchInstructorBody(
    body: unknown,
): { record: BffCoursePatchInstructorBody } | { error: string } {
    const recordResult = coursePatchRecordSchema.safeParse(body);

    if (!recordResult.success) {
        return { error: 'Nieprawidłowe dane żądania.' };
    }

    const coursePatchRecord = recordResult.data;

    const record: BffCoursePatchInstructorBody = {};

    for (const key of ['name', 'category'] as const) {
        if (!(key in coursePatchRecord)) continue;

        const value = coursePatchRecord[key];

        if (typeof value !== 'string' || !value.trim())
            return { error: `Nieprawidłowe pole ${key}.` };

        record[key] = value.trim();
    }

    if ('kind' in coursePatchRecord) {
        const value = coursePatchRecord.kind;

        if (
            value !== 'THEORY_GROUP' &&
            value !== 'PRACTICAL' &&
            value !== 'EXTRA'
        )
            return { error: 'Nieprawidłowy rodzaj kursu.' };

        record.kind = value;
    }

    for (const key of ['totalHours', 'capacity'] as const) {
        if (!(key in coursePatchRecord)) continue;

        const value = coursePatchRecord[key];

        if (key === 'capacity' && value === null) {
            record.capacity = null;
            continue;
        }

        if (
            typeof value !== 'number' ||
            !Number.isInteger(value) ||
            value < (key === 'totalHours' ? 1 : 0)
        )
            return { error: `Nieprawidłowe pole ${key}.` };

        record[key] = value;
    }

    for (const key of ['theoryStartDate', 'theoryEndDate'] as const) {
        if (!(key in coursePatchRecord)) continue;

        const value = coursePatchRecord[key];

        if (
            value !== null &&
            (typeof value !== 'string' ||
                !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
                Number.isNaN(Date.parse(value)))
        )
            return { error: `Nieprawidłowe pole ${key}.` };

        record[key] = value as string | null;
    }

    if (!('instructorId' in coursePatchRecord)) return { record };

    const rawInstructorId = coursePatchRecord.instructorId;

    if (rawInstructorId === null) {
        return { record: { ...record, instructorId: null } };
    }

    const trimmedInstructorId =
        typeof rawInstructorId === 'string'
            ? rawInstructorId.trim()
            : String(rawInstructorId).trim();

    if (!trimmedInstructorId) {
        return { record: { ...record, instructorId: null } };
    }

    if (!isUuid(trimmedInstructorId)) {
        return {
            error: 'Pole instructorId musi być poprawnym identyfikatorem UUID lub null.',
        };
    }

    return { record: { ...record, instructorId: trimmedInstructorId } };
}
