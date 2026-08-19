import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamCoursesGetById } from '~~/server/utils/courses/coursesBff';
import { bffMockCoursesGetById } from '~~/server/utils/courses/coursesMockBff';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora kursu.',
        invalid: 'Nieprawidłowy identyfikator kursu.',
    });

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamCoursesGetById(event, upstreamBase, id),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockCoursesGetById(id);
        },
    });
});
