import { randomUUID } from 'node:crypto';
import { bffOwnLessonCancel } from '~~/server/utils/lessonsBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/requestValidation';
import { requireStudentFromCookie } from '~~/server/utils/requireStudentFromCookie';

export default defineEventHandler(async (event) => {
    const lessonId = parseRequiredUuidRouterParam(event, 'lessonId', {
        required: 'Nieprawidlowy identyfikator lekcji.',
        invalid: 'Nieprawidlowy identyfikator lekcji.',
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffOwnLessonCancel(event, upstream, lessonId);
    }

    await requireStudentFromCookie(event);

    return {
        success: true,
        data: {
            lesson: {
                id: lessonId,
                courseId: randomUUID(),
                studentId: randomUUID(),
                instructorId: randomUUID(),
                vehicleId: randomUUID(),
                lessonType: 'PRACTICE',
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                status: 'CANCELLED',
                createdAt: new Date().toISOString(),
            },
        },
    };
});
