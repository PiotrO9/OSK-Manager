import { isUuid } from '~~/server/utils/validation/requestValidation';

export interface BffLessonCreateBody {
    courseId: string;
    studentId: string;
    instructorId: string;
    startTime: string;
    endTime: string;
    lessonType: 'PRACTICE';
    vehicleId: string;
}

export function parseLessonCreateBody(
    raw: unknown,
): { ok: true; body: BffLessonCreateBody } | { ok: false; message: string } {
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

    return {
        ok: true,
        body: {
            courseId,
            studentId,
            instructorId,
            startTime,
            endTime,
            lessonType: 'PRACTICE',
            vehicleId,
        },
    };
}
