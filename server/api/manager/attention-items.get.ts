import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import {
    bffMockManagerAttentionItems,
    bffUpstreamManagerAttentionItems,
} from '~~/server/utils/manager/attentionItemsBff';
import {
    isUuid,
    parseRequiredUuidQuery,
} from '~~/server/utils/validation/requestValidation';

export default defineEventHandler(async (event) => {
    const rawQuery = getQuery(event);
    const schoolId = parseRequiredUuidQuery(rawQuery, 'schoolId', {
        required: 'Parametr schoolId jest wymagany.',
        invalid: 'Parametr schoolId musi być poprawnym identyfikatorem UUID.',
    });

    if (!isUuid(schoolId)) {
        throw createError({
            statusCode: 400,
            message: 'Parametr schoolId musi być poprawnym UUID.',
        });
    }

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamManagerAttentionItems(event, upstreamBase, schoolId),
        mock: async () => {
            await requireManagerFromCookie(event);

            return bffMockManagerAttentionItems(schoolId);
        },
    });
});
