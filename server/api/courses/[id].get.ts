import { bffUpstreamCoursesGetById } from '~~/server/utils/courses/coursesBff';
import { bffMockCoursesGetById } from '~~/server/utils/courses/coursesMockBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora kursu.',
        invalid: 'Nieprawidłowy identyfikator kursu.',
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamCoursesGetById(event, upstream, id);
    }

    await requireManagerFromCookie(event);

    return bffMockCoursesGetById(id);
});
