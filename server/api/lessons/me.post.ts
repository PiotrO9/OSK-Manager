import { randomUUID } from 'node:crypto';
import { bffOwnLessonPost } from '~~/server/utils/lessonsBff';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';
import { requireStudentFromCookie } from '~~/server/utils/requireStudentFromCookie';

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

function validateOwnLessonBody(raw: unknown):
    | {
          ok: true;
          body: {
              courseId: string;
              instructorId: string;
              startTime: string;
              endTime: string;
          };
      }
    | { ok: false; message: string } {
    if (!raw || typeof raw !== 'object') {
        return { ok: false, message: 'Oczekiwano obiektu JSON.' };
    }

    const o = raw as Record<string, unknown>;
    const allowed = new Set([
        'courseId',
        'instructorId',
        'startTime',
        'endTime',
    ]);
    const extraKey = Object.keys(o).find((key) => !allowed.has(key));

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

export default defineEventHandler(async (event) => {
    const rawBody = await readBody(event);
    const parsed = validateOwnLessonBody(rawBody);

    if (!parsed.ok) {
        throw createError({
            statusCode: 400,
            message: parsed.message,
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        const result = await bffOwnLessonPost(event, upstream, parsed.body);

        setResponseStatus(event, 201);

        return result;
    }

    await requireStudentFromCookie(event);

    const now = new Date().toISOString();

    setResponseStatus(event, 201);

    return {
        success: true,
        data: {
            lesson: {
                id: randomUUID(),
                courseId: parsed.body.courseId,
                studentId: randomUUID(),
                instructorId: parsed.body.instructorId,
                vehicleId: randomUUID(),
                lessonType: 'PRACTICE',
                startTime: parsed.body.startTime,
                endTime: parsed.body.endTime,
                status: 'SCHEDULED',
                createdAt: now,
            },
        },
    };
});
