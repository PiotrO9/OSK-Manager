import { isUuid } from '~~/server/utils/validation/requestValidation';

export interface BffLessonPatchBody {
    instructorId?: string;
    startTime?: string;
    endTime?: string;
    vehicleId?: string | null;
}

export function parseLessonPatchBody(
    raw: unknown,
): { ok: true; body: BffLessonPatchBody } | { ok: false; message: string } {
    if (raw === null || raw === undefined) {
        return { ok: true, body: {} };
    }

    if (typeof raw !== 'object') {
        return { ok: false, message: 'Oczekiwano obiektu JSON.' };
    }

    const o = raw as Record<string, unknown>;
    const body: BffLessonPatchBody = {};

    if ('instructorId' in o) {
        const id =
            typeof o.instructorId === 'string' ? o.instructorId.trim() : '';

        if (!id || !isUuid(id)) {
            return {
                ok: false,
                message: 'Pole instructorId musi być poprawnym UUID.',
            };
        }

        body.instructorId = id;
    }

    if ('startTime' in o) {
        const startTime =
            typeof o.startTime === 'string' ? o.startTime.trim() : '';

        if (!startTime) {
            return {
                ok: false,
                message: 'Pole startTime nie może być puste.',
            };
        }

        body.startTime = startTime;
    }

    if ('endTime' in o) {
        const endTime = typeof o.endTime === 'string' ? o.endTime.trim() : '';

        if (!endTime) {
            return {
                ok: false,
                message: 'Pole endTime nie może być puste.',
            };
        }

        body.endTime = endTime;
    }

    if ('vehicleId' in o) {
        const v = o.vehicleId;

        if (v === null) {
            body.vehicleId = null;
        } else if (typeof v === 'string') {
            const t = v.trim();

            if (!t || !isUuid(t)) {
                return {
                    ok: false,
                    message: 'Pole vehicleId musi być poprawnym UUID lub null.',
                };
            }

            body.vehicleId = t;
        } else {
            return {
                ok: false,
                message: 'Pole vehicleId musi być poprawnym UUID lub null.',
            };
        }
    }

    return { ok: true, body };
}
