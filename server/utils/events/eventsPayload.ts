import { createError } from 'h3';
import type { InstructorEventResponse } from './eventsTypes';

export function assertEventPayload(
    data: { event?: InstructorEventResponse } | undefined,
): InstructorEventResponse {
    const ev = data?.event;

    if (!ev || typeof ev !== 'object') {
        throw createError({
            statusCode: 502,
            statusMessage: 'Nieprawidłowa odpowiedź serwera',
        });
    }

    return ev;
}

export function normalizeStudentUserIds(raw: unknown): string[] {
    const out: string[] = [];

    if (!Array.isArray(raw)) return out;

    for (const item of raw) {
        if (typeof item === 'string' && item.trim()) {
            out.push(item.trim());
        }
    }

    return out;
}
