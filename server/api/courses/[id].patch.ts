import { bffUpstreamCoursesPatch } from '~~/server/utils/courses/coursesBff';
import { bffMockCoursesPatch } from '~~/server/utils/courses/coursesMockBff';
import { parseCoursePatchInstructorBody } from '~~/server/utils/courses/parseCoursePatchBody';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora kursu.',
        invalid: 'Nieprawidłowy identyfikator kursu.',
    });

    const parsed = parseCoursePatchInstructorBody(await readBody(event));

    if ('error' in parsed) {
        throw createError({
            statusCode: 400,
            message: parsed.error,
        });
    }

    const { record } = parsed;
    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamCoursesPatch(event, upstream, id, record);
    }

    await requireManagerFromCookie(event);

    return bffMockCoursesPatch(id, record);
});
