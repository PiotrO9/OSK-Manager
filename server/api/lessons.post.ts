import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffLessonsPost } from '~~/server/utils/lessons/lessonsBff';
import { parseLessonCreateBody } from '~~/server/utils/lessons/parseLessonCreateBody';

export default defineEventHandler(async (event) => {
    const rawBody = await readBody(event);
    const parsed = parseLessonCreateBody(rawBody);

    if (!parsed.ok) {
        throw createError({
            statusCode: 400,
            message: parsed.message,
        });
    }

    return executeBffAdapter(event, {
        upstream: async ({ upstreamBase }) => {
            const result = await bffLessonsPost(
                event,
                upstreamBase,
                parsed.body,
            );

            setResponseStatus(event, 201);

            return result;
        },
        mock: async () => {
            await requireManagerFromCookie(event);

            setResponseStatus(event, 201);

            return bffMockLessonsPost(parsed.body);
        },
    });
});
