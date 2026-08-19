import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { bffUpstreamInstructorsPatch } from '~~/server/utils/instructors/instructorsBff';
import { bffMockInstructorsPatch } from '~~/server/utils/instructors/instructorsMockBff';
import { stripInstructorPatchBody } from '~~/server/utils/instructors/parseInstructorPatchBody';
import { parseRequiredUuidRouterParam } from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const id = parseRequiredUuidRouterParam(event, 'id', {
        required: 'Brak identyfikatora instruktora.',
        invalid: 'Nieprawidłowy identyfikator instruktora.',
    });

    const rawBody = await readBody(event);
    const patch = stripInstructorPatchBody(rawBody);

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamInstructorsPatch(event, upstreamBase, id, patch),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockInstructorsPatch(id, patch);
        },
    });
});
