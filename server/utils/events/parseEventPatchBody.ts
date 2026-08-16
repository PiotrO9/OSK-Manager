import { isUuid } from '~~/server/utils/validation/requestValidation';

export type BffEventPatchType = 'DRIVE' | 'THEORY';
export type BffEventPatchStatus = 'PLANNED' | 'DONE' | 'NO_SHOW' | 'CANCELLED';

export interface BffEventPatchBody {
    instructorId?: string;
    type?: BffEventPatchType;
    startTime?: string;
    endTime?: string;
    vehicleId?: string | null;
    capacity?: number | null;
    status?: BffEventPatchStatus;
}

const EVENT_PATCH_STATUSES = new Set<BffEventPatchStatus>([
    'PLANNED',
    'DONE',
    'NO_SHOW',
    'CANCELLED',
]);

function parseOptionalCapacityPatch(
    raw: unknown,
): number | null | false | undefined {
    if (raw === undefined) {
        return undefined;
    }

    if (raw === null) {
        return null;
    }

    if (typeof raw === 'number') {
        if (!Number.isFinite(raw) || raw < 0 || Math.floor(raw) !== raw) {
            return false;
        }

        return raw;
    }

    if (typeof raw === 'string') {
        const t = raw.trim();

        if (t === '') {
            return undefined;
        }

        const n = Number.parseInt(t, 10);

        if (!Number.isFinite(n) || n < 0) {
            return false;
        }

        return n;
    }

    return false;
}

export function parseEventPatchBody(
    raw: unknown,
): { ok: true; body: BffEventPatchBody } | { ok: false; message: string } {
    if (raw === null || raw === undefined) {
        return { ok: true, body: {} };
    }

    if (typeof raw !== 'object') {
        return { ok: false, message: 'Oczekiwano obiektu JSON.' };
    }

    const o = raw as Record<string, unknown>;
    const body: BffEventPatchBody = {};

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

    if ('type' in o) {
        const typeRaw = typeof o.type === 'string' ? o.type.trim() : '';
        const type =
            typeRaw === 'DRIVE' || typeRaw === 'THEORY' ? typeRaw : null;

        if (!type) {
            return {
                ok: false,
                message: 'Pole type musi być DRIVE lub THEORY.',
            };
        }

        body.type = type;
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

    if ('capacity' in o) {
        const cap = parseOptionalCapacityPatch(o.capacity);

        if (cap === false) {
            return {
                ok: false,
                message:
                    'Pole capacity musi być nieujemną liczbą całkowitą, null lub puste.',
            };
        }

        if (cap !== undefined) body.capacity = cap;
    }

    if ('status' in o) {
        const sRaw = typeof o.status === 'string' ? o.status.trim() : '';

        if (!EVENT_PATCH_STATUSES.has(sRaw as BffEventPatchStatus)) {
            return {
                ok: false,
                message:
                    'Pole status musi być PLANNED, DONE, NO_SHOW lub CANCELLED.',
            };
        }

        body.status = sRaw as BffEventPatchStatus;
    }

    return { ok: true, body };
}
