import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffLessonsPatch } from '~~/server/utils/lessons/lessonsBff';
import {
    isUuid,
    parseRequiredUuidRouterParam,
} from '~~/server/utils/validation/requestValidation';

function validatePatchBody(
    raw: unknown,
):
    | { ok: true; body: Record<string, unknown> }
    | { ok: false; message: string } {
    if (raw === null || raw === undefined) {
        return { ok: true, body: {} };
    }

    if (typeof raw !== 'object') {
        return { ok: false, message: 'Oczekiwano obiektu JSON.' };
    }

    const o = raw as Record<string, unknown>;
    const body: Record<string, unknown> = {};

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

export default defineEventHandler(async (event) => {
    const lessonId = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora lekcji.',
        invalid: 'Nieprawidłowy identyfikator lekcji.',
    });

    const rawBody = await readBody(event);
    const parsed = validatePatchBody(rawBody);

    if (!parsed.ok) {
        throw createError({
            statusCode: 400,
            message: parsed.message,
        });
    }

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffLessonsPatch(event, upstreamBase, lessonId, parsed.body),
        mock: async () => {
            await requireManagerFromCookie(event);

            const now = new Date().toISOString();
            const b = parsed.body;

            return {
                success: true,
                data: {
                    lesson: {
                        id: lessonId,
                        courseId: '00000000-0000-4000-8000-000000000001',
                        studentId: '00000000-0000-4000-8000-000000000002',
                        instructorId:
                            (b.instructorId as string | undefined) ??
                            '00000000-0000-4000-8000-000000000003',
                        vehicleId:
                            b.vehicleId !== undefined
                                ? (b.vehicleId as string | null)
                                : '00000000-0000-4000-8000-000000000004',
                        lessonType: 'PRACTICE',
                        startTime: (b.startTime as string | undefined) ?? now,
                        endTime: (b.endTime as string | undefined) ?? now,
                        status: 'SCHEDULED',
                        createdAt: now,
                    },
                },
            };
        },
    });
});
