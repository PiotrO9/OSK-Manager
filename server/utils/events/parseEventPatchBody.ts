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
        const trimmedValue = raw.trim();

        if (trimmedValue === '') {
            return undefined;
        }

        const parsedCapacity = Number.parseInt(trimmedValue, 10);

        if (!Number.isFinite(parsedCapacity) || parsedCapacity < 0) {
            return false;
        }

        return parsedCapacity;
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

    const eventRecord = raw as Record<string, unknown>;
    const body: BffEventPatchBody = {};

    if ('instructorId' in eventRecord) {
        const id =
            typeof eventRecord.instructorId === 'string'
                ? eventRecord.instructorId.trim()
                : '';

        if (!id || !isUuid(id)) {
            return {
                ok: false,
                message: 'Pole instructorId musi być poprawnym UUID.',
            };
        }

        body.instructorId = id;
    }

    if ('type' in eventRecord) {
        const typeRaw =
            typeof eventRecord.type === 'string' ? eventRecord.type.trim() : '';
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

    if ('startTime' in eventRecord) {
        const startTime =
            typeof eventRecord.startTime === 'string'
                ? eventRecord.startTime.trim()
                : '';

        if (!startTime) {
            return {
                ok: false,
                message: 'Pole startTime nie może być puste.',
            };
        }

        body.startTime = startTime;
    }

    if ('endTime' in eventRecord) {
        const endTime =
            typeof eventRecord.endTime === 'string'
                ? eventRecord.endTime.trim()
                : '';

        if (!endTime) {
            return {
                ok: false,
                message: 'Pole endTime nie może być puste.',
            };
        }

        body.endTime = endTime;
    }

    if ('vehicleId' in eventRecord) {
        const vehicleIdValue = eventRecord.vehicleId;

        if (vehicleIdValue === null) {
            body.vehicleId = null;
        } else if (typeof vehicleIdValue === 'string') {
            const trimmedValue = vehicleIdValue.trim();

            if (!trimmedValue || !isUuid(trimmedValue)) {
                return {
                    ok: false,
                    message: 'Pole vehicleId musi być poprawnym UUID lub null.',
                };
            }

            body.vehicleId = trimmedValue;
        } else {
            return {
                ok: false,
                message: 'Pole vehicleId musi być poprawnym UUID lub null.',
            };
        }
    }

    if ('capacity' in eventRecord) {
        const capacity = parseOptionalCapacityPatch(eventRecord.capacity);

        if (capacity === false) {
            return {
                ok: false,
                message:
                    'Pole capacity musi być nieujemną liczbą całkowitą, null lub puste.',
            };
        }

        if (capacity !== undefined) body.capacity = capacity;
    }

    if ('status' in eventRecord) {
        const statusRaw =
            typeof eventRecord.status === 'string'
                ? eventRecord.status.trim()
                : '';

        if (!EVENT_PATCH_STATUSES.has(statusRaw as BffEventPatchStatus)) {
            return {
                ok: false,
                message:
                    'Pole status musi być PLANNED, DONE, NO_SHOW lub CANCELLED.',
            };
        }

        body.status = statusRaw as BffEventPatchStatus;
    }

    return { ok: true, body };
}
