import { randomUUID } from 'node:crypto';
import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffOwnLessonCancel } from '~~/server/utils/lessons/lessonsBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';
import { requireStudentFromCookie } from '~~/server/utils/auth/requireStudentFromCookie';

export default defineEventHandler(async (event) => {
    const lessonId = parseRequiredUuidRouterParam(event, 'lessonId', {
        required: 'Nieprawidlowy identyfikator lekcji.',
        invalid: 'Nieprawidlowy identyfikator lekcji.',
    });

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffOwnLessonCancel(event, upstreamBase, lessonId),
        mock: async () => {
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
                        endTime: new Date(
                            Date.now() + 60 * 60 * 1000,
                        ).toISOString(),
                        status: 'CANCELLED',
                        createdAt: new Date().toISOString(),
                    },
                },
            };
        },
    });
});
