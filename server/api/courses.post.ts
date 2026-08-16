import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamCoursesCreate } from '~~/server/utils/courses/coursesBff';
import { bffMockCoursesCreate } from '~~/server/utils/courses/coursesMockBff';
import {
    courseCreateBodyToUpstreamRecord,
    parseCourseCreateBody,
} from '~~/server/utils/courses/parseCourseCreateBody';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const parsed = parseCourseCreateBody(body);

    if ('error' in parsed) {
        throw createError({
            statusCode: 400,
            message: parsed.error,
        });
    }

    const { bffBody } = parsed;

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamCoursesCreate(
                event,
                upstreamBase,
                courseCreateBodyToUpstreamRecord(bffBody),
            ),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockCoursesCreate(bffBody);
        },
    });
});
