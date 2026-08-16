import { isUuid } from '~~/server/utils/validation/requestValidation';

export interface BffOwnLessonCreateBody {
    courseId: string;
    instructorId: string;
    startTime: string;
    endTime: string;
}

const OWN_LESSON_BODY_KEYS = new Set([
    'courseId',
    'instructorId',
    'startTime',
    'endTime',
]);

function readRequiredUuid(
    body: Record<string, unknown>,
    key: 'courseId' | 'instructorId',
): string | null {
    const value = typeof body[key] === 'string' ? body[key].trim() : '';

    return value && isUuid(value) ? value : null;
}

function readRequiredIsoDateTime(
    body: Record<string, unknown>,
    key: 'startTime' | 'endTime',
): string | null {
    const value = typeof body[key] === 'string' ? body[key].trim() : '';

    if (!value) {
        return null;
    }

    const d = new Date(value);

    return Number.isNaN(d.getTime()) ? null : value;
}

export function parseOwnLessonBody(
    raw: unknown,
): { ok: true; body: BffOwnLessonCreateBody } | { ok: false; message: string } {
    if (!raw || typeof raw !== 'object') {
        return { ok: false, message: 'Oczekiwano obiektu JSON.' };
    }

    const o = raw as Record<string, unknown>;
    const extraKey = Object.keys(o).find(
        (key) => !OWN_LESSON_BODY_KEYS.has(key),
    );

    if (extraKey) {
        return {
            ok: false,
            message: `Pole ${extraKey} nie jest dozwolone dla rezerwacji kursanta.`,
        };
    }

    const courseId = readRequiredUuid(o, 'courseId');

    if (!courseId) {
        return { ok: false, message: 'Pole courseId musi byc poprawnym UUID.' };
    }

    const instructorId = readRequiredUuid(o, 'instructorId');

    if (!instructorId) {
        return {
            ok: false,
            message: 'Pole instructorId musi byc poprawnym UUID.',
        };
    }

    const startTime = readRequiredIsoDateTime(o, 'startTime');
    const endTime = readRequiredIsoDateTime(o, 'endTime');

    if (!startTime || !endTime) {
        return {
            ok: false,
            message: 'Pola startTime i endTime sa wymagane w formacie ISO.',
        };
    }

    if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
        return {
            ok: false,
            message: 'startTime musi byc przed endTime.',
        };
    }

    return { ok: true, body: { courseId, instructorId, startTime, endTime } };
}
