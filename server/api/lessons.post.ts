import { randomUUID } from 'node:crypto';
import { bffLessonsPost } from '~~/server/utils/lessonsBff';
import { isUuid } from '~~/server/utils/parseVehicleRequestBody';

type LessonTypeLiteral = 'THEORY' | 'PRACTICE';

function validateLessonBody(raw: unknown):
    | {
          ok: true;
          body: Record<string, unknown>;
      }
    | { ok: false; message: string } {
    if (!raw || typeof raw !== 'object') {
        return { ok: false, message: 'Oczekiwano obiektu JSON.' };
    }

    const o = raw as Record<string, unknown>;

    const courseId = typeof o.courseId === 'string' ? o.courseId.trim() : '';

    if (!courseId || !isUuid(courseId)) {
        return {
            ok: false,
            message: 'Pole courseId musi być poprawnym UUID.',
        };
    }

    const studentId = typeof o.studentId === 'string' ? o.studentId.trim() : '';

    if (!studentId || !isUuid(studentId)) {
        return {
            ok: false,
            message: 'Pole studentId musi być poprawnym UUID.',
        };
    }

    const instructorId =
        typeof o.instructorId === 'string' ? o.instructorId.trim() : '';

    if (!instructorId || !isUuid(instructorId)) {
        return {
            ok: false,
            message: 'Pole instructorId musi być poprawnym UUID.',
        };
    }

    const startTime = typeof o.startTime === 'string' ? o.startTime.trim() : '';
    const endTime = typeof o.endTime === 'string' ? o.endTime.trim() : '';

    if (!startTime || !endTime) {
        return {
            ok: false,
            message: 'Pola startTime i endTime są wymagane (ISO 8601).',
        };
    }

    const ltRaw = typeof o.lessonType === 'string' ? o.lessonType.trim() : '';

    if (ltRaw === 'THEORY') {
        return {
            ok: false,
            message:
                'Rezerwacja lekcji z slotu dotyczy wyłącznie jazdy praktycznej. Lekcje teoretyczne są grupowe — zaplanuj je w widoku grupy lub wydarzenia THEORY.',
        };
    }

    if (ltRaw !== 'PRACTICE') {
        return {
            ok: false,
            message: 'Pole lessonType musi być PRACTICE.',
        };
    }

    const vehicleId = typeof o.vehicleId === 'string' ? o.vehicleId.trim() : '';

    if (!vehicleId || !isUuid(vehicleId)) {
        return {
            ok: false,
            message:
                'Dla lekcji praktycznej wymagane jest pole vehicleId (UUID).',
        };
    }

    const out: Record<string, unknown> = {
        courseId,
        studentId,
        instructorId,
        startTime,
        endTime,
        lessonType: 'PRACTICE' satisfies LessonTypeLiteral,
        vehicleId,
    };

    return { ok: true, body: out };
}

export default defineEventHandler(async (event) => {
    const rawBody = await readBody(event);
    const parsed = validateLessonBody(rawBody);

    if (!parsed.ok) {
        throw createError({
            statusCode: 400,
            message: parsed.message,
        });
    }

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        const result = await bffLessonsPost(event, upstream, parsed.body);

        setResponseStatus(event, 201);

        return result;
    }

    await requireManagerFromCookie(event);

    const now = new Date().toISOString();

    setResponseStatus(event, 201);

    return {
        success: true,
        data: {
            lesson: {
                id: randomUUID(),
                courseId: String(parsed.body.courseId),
                studentId: randomUUID(),
                instructorId: String(parsed.body.instructorId),
                vehicleId: String(parsed.body.vehicleId ?? ''),
                lessonType: String(parsed.body.lessonType),
                startTime: String(parsed.body.startTime),
                endTime: String(parsed.body.endTime),
                status: 'SCHEDULED',
                createdAt: now,
            },
        },
    };
});
