import { setResponseHeader } from 'h3';
import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import { refreshMockSession } from '~~/server/utils/auth/mockAuthSession';

export default defineEventHandler(async (event) => {
    setResponseHeader(event, 'Cache-Control', 'private, no-store');

    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) => bffUpstreamRefresh(event, upstreamBase),
        mock: async () => {
            await refreshMockSession(event);

            return {
                success: true,
                data: {},
            };
        },
    });
});
