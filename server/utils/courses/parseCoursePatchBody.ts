import { isUuid } from '~~/server/utils/validation/requestValidation';
import { z } from 'zod';

const coursePatchRecordSchema = z.custom<Record<string, unknown>>(
    (value) => value !== null && typeof value === 'object',
);

export interface BffCoursePatchInstructorBody {
    instructorId?: string | null;
}

/**
 * Parsuje body PATCH `/courses/:id` — tylko `instructorId` (MVP).
 * Brak klucza `instructorId` → pusty rekord `{}` (no-op wg BE).
 */
export function parseCoursePatchInstructorBody(
    body: unknown,
): { record: BffCoursePatchInstructorBody } | { error: string } {
    const recordResult = coursePatchRecordSchema.safeParse(body);

    if (!recordResult.success) {
        return { error: 'Nieprawidłowe dane żądania.' };
    }

    const coursePatchRecord = recordResult.data;

    if (!('instructorId' in coursePatchRecord)) {
        return { record: {} };
    }

    const rawInstructorId = coursePatchRecord.instructorId;

    if (rawInstructorId === null) {
        return { record: { instructorId: null } };
    }

    const trimmedInstructorId =
        typeof rawInstructorId === 'string'
            ? rawInstructorId.trim()
            : String(rawInstructorId).trim();

    if (!trimmedInstructorId) {
        return { record: { instructorId: null } };
    }

    if (!isUuid(trimmedInstructorId)) {
        return {
            error: 'Pole instructorId musi być poprawnym identyfikatorem UUID lub null.',
        };
    }

    return { record: { instructorId: trimmedInstructorId } };
}
