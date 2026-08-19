import { executeBffAdapter } from '~~/server/utils/bff/bffAdapterExecutor';

export default defineEventHandler(async (event) => {
    return executeBffAdapter(event, {
        upstream: ({ upstreamBase }) => bffUpstreamLogout(event, upstreamBase),
        mock: () => {
            deleteCookie(event, 'access_token', { path: '/' });
            deleteCookie(event, 'refresh_token', { path: '/' });

            return {
                success: true,
            };
        },
    });
});
