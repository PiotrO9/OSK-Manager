import { isUuid } from '~~/server/utils/validation/requestValidation';
import { z } from 'zod';

const coursePatchRecordSchema = z.custom<Record<string, unknown>>(
    (value) => value !== null && typeof value === 'object',
);

/**
 * Parsuje body PATCH `/courses/:id` — tylko `instructorId` (MVP).
 * Brak klucza `instructorId` → pusty rekord `{}` (no-op wg BE).
 */
export function parseCoursePatchInstructorBody(
    body: unknown,
): { record: Record<string, unknown> } | { error: string } {
    const recordResult = coursePatchRecordSchema.safeParse(body);

    if (!recordResult.success) {
        return { error: 'Nieprawidłowe dane żądania.' };
    }

    const o = recordResult.data;

    if (!('instructorId' in o)) {
        return { record: {} };
    }

    const raw = o.instructorId;

    if (raw === null) {
        return { record: { instructorId: null } };
    }

    const s = typeof raw === 'string' ? raw.trim() : String(raw).trim();

    if (!s) {
        return { record: { instructorId: null } };
    }

    if (!isUuid(s)) {
        return {
            error: 'Pole instructorId musi być poprawnym identyfikatorem UUID lub null.',
        };
    }

    return { record: { instructorId: s } };
}
