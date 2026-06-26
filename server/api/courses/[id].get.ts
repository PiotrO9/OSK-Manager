import { bffUpstreamCoursesGetById } from '~~/server/utils/coursesBff';
import { bffMockCoursesGetById } from '~~/server/utils/coursesMockBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora kursu.',
        invalid: 'NieprawidĹ‚owy identyfikator kursu.',
    });

    const upstream = resolveUpstreamBase(event);

    if (upstream) {
        return bffUpstreamCoursesGetById(event, upstream, id);
    }

    await requireManagerFromCookie(event);

    return bffMockCoursesGetById(id);
});
