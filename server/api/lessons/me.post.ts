import { randomUUID } from 'node:crypto';
import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import {
    bffOwnLessonPost,
    type LessonCreateResponse,
} from '~~/server/utils/lessons/lessonsBff';
import { parseOwnLessonBody } from '~~/server/utils/lessons/parseOwnLessonBody';
import { requireStudentFromCookie } from '~~/server/utils/auth/requireStudentFromCookie';

interface OwnLessonCreateResponse {
    success: true;
    data: { lesson: LessonCreateResponse };
}

export default defineEventHandler(async (event) => {
    const rawBody = await readBody(event);
    const parsed = parseOwnLessonBody(rawBody);

    if (!parsed.ok) {
        throw createError({
            statusCode: 400,
            message: parsed.message,
        });
    }

    return executeBffAdapter<OwnLessonCreateResponse>(event, {
        upstream: async ({ upstreamBase }) => {
            const result = await bffOwnLessonPost(
                event,
                upstreamBase,
                parsed.body,
            );

            setResponseStatus(event, 201);

            return result;
        },
        mock: async () => {
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
        },
    });
});
