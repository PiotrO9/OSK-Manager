import { isUuid } from '../validation/requestValidation';

const MAX_IDS = 50;

export interface ParsedEventStudentsBody {
    studentIds: string[];
    startTime?: string;
    endTime?: string;
}

export function validateEventStudentsBody(
    raw: unknown,
    options: { allowWindow?: boolean } = {},
):
    | { ok: true; data: ParsedEventStudentsBody }
    | { ok: false; message: string } {
    if (!raw || typeof raw !== 'object') {
        return { ok: false, message: 'Oczekiwano obiektu JSON.' };
    }

    const body = raw as Record<string, unknown>;

    if (!Array.isArray(body.studentIds)) {
        return { ok: false, message: 'Pole studentIds musi być tablicą UUID.' };
    }

    if (body.studentIds.length > MAX_IDS) {
        return {
            ok: false,
            message: `Pole studentIds może mieć co najwyżej ${MAX_IDS} elementów.`,
        };
    }

    const studentIds: string[] = [];

    for (const item of body.studentIds) {
        if (typeof item !== 'string' || !isUuid(item.trim())) {
            return {
                ok: false,
                message: 'Każdy element studentIds musi być poprawnym UUID.',
            };
        }

        studentIds.push(item.trim());
    }

    if (new Set(studentIds).size !== studentIds.length) {
        return {
            ok: false,
            message: 'Pole studentIds nie może zawierać duplikatów.',
        };
    }

    if (!options.allowWindow) {
        return { ok: true, data: { studentIds } };
    }

    const startTime = readOptionalIso(body.startTime);
    const endTime = readOptionalIso(body.endTime);

    if (startTime === null || endTime === null) {
        return {
            ok: false,
            message: 'Początek i koniec muszą być poprawnymi datami ISO.',
        };
    }

    if ((startTime === undefined) !== (endTime === undefined)) {
        return {
            ok: false,
            message: 'Początek i koniec trzeba przekazać razem.',
        };
    }

    if (
        startTime !== undefined &&
        endTime !== undefined &&
        Date.parse(startTime) >= Date.parse(endTime)
    ) {
        return { ok: false, message: 'Początek musi być przed końcem.' };
    }

    return { ok: true, data: { studentIds, startTime, endTime } };
}

function readOptionalIso(value: unknown): string | undefined | null {
    if (value === undefined) {
        return undefined;
    }

    if (typeof value !== 'string' || !value.trim()) {
        return null;
    }

    const normalized = value.trim();

    return Number.isNaN(Date.parse(normalized)) ? null : normalized;
}
