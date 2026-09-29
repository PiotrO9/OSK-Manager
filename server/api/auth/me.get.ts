import { setResponseHeader } from 'h3';
import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';
import type { BffAuthUserResponse } from '~~/server/utils/auth/authTypes';
import { resolveMockSession } from '~~/server/utils/auth/mockAuthSession';

interface AuthMeResponse {
    success: true;
    data: { user: BffAuthUserResponse };
}

export default defineEventHandler(async (event) => {
    setResponseHeader(event, 'Cache-Control', 'private, no-store');

    return executeBffAdapter<AuthMeResponse>(event, {
        upstream: ({ upstreamBase }) =>
            bffUpstreamResolveSession(event, upstreamBase),
        mock: async () => {
            const user = await resolveMockSession(event);

            return {
                success: true,
                data: { user },
            };
        },
    });
});
