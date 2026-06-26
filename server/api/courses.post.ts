import { bffUpstreamCoursesCreate } from '~~/server/utils/coursesBff';
import { bffMockCoursesCreate } from '~~/server/utils/coursesMockBff';
import {
    courseCreateBodyToUpstreamRecord,
    parseCourseCreateBody,
} from '~~/server/utils/parseCourseCreateBody';

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
    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamCoursesCreate(
            event,
            upstream,
            courseCreateBodyToUpstreamRecord(bffBody),
        );
    }

    await requireManagerFromCookie(event);

    return bffMockCoursesCreate(bffBody);
});
