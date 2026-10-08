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

    const lessonRecord = raw as Record<string, unknown>;
    const body: BffLessonPatchBody = {};

    if ('instructorId' in lessonRecord) {
        const id =
            typeof lessonRecord.instructorId === 'string'
                ? lessonRecord.instructorId.trim()
                : '';

        if (!id || !isUuid(id)) {
            return {
                ok: false,
                message: 'Pole instructorId musi być poprawnym UUID.',
            };
        }

        body.instructorId = id;
    }

    if ('startTime' in lessonRecord) {
        const startTime =
            typeof lessonRecord.startTime === 'string'
                ? lessonRecord.startTime.trim()
                : '';

        if (!startTime) {
            return {
                ok: false,
                message: 'Pole startTime nie może być puste.',
            };
        }

        body.startTime = startTime;
    }

    if ('endTime' in lessonRecord) {
        const endTime =
            typeof lessonRecord.endTime === 'string'
                ? lessonRecord.endTime.trim()
                : '';

        if (!endTime) {
            return {
                ok: false,
                message: 'Pole endTime nie może być puste.',
            };
        }

        body.endTime = endTime;
    }

    if ('vehicleId' in lessonRecord) {
        const vehicleIdValue = lessonRecord.vehicleId;

        if (vehicleIdValue === null) {
            body.vehicleId = null;
        } else if (typeof vehicleIdValue === 'string') {
            const trimmedVehicleId = vehicleIdValue.trim();

            if (!trimmedVehicleId || !isUuid(trimmedVehicleId)) {
                return {
                    ok: false,
                    message: 'Pole vehicleId musi być poprawnym UUID lub null.',
                };
            }

            body.vehicleId = trimmedVehicleId;
        } else {
            return {
                ok: false,
                message: 'Pole vehicleId musi być poprawnym UUID lub null.',
            };
        }
    }

    return { ok: true, body };
}
