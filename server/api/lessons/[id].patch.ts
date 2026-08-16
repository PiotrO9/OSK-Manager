import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffLessonsPatch } from '~~/server/utils/lessons/lessonsBff';
import { parseLessonPatchBody } from '~~/server/utils/lessons/parseLessonPatchBody';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const lessonId = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora lekcji.',
        invalid: 'Nieprawidłowy identyfikator lekcji.',
    });

    const rawBody = await readBody(event);
    const parsed = parseLessonPatchBody(rawBody);

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
                            b.instructorId ??
                            '00000000-0000-4000-8000-000000000003',
                        vehicleId:
                            b.vehicleId !== undefined
                                ? b.vehicleId
                                : '00000000-0000-4000-8000-000000000004',
                        lessonType: 'PRACTICE',
                        startTime: b.startTime ?? now,
                        endTime: b.endTime ?? now,
                        status: 'SCHEDULED',
                        createdAt: now,
                    },
                },
            };
        },
    });
});
