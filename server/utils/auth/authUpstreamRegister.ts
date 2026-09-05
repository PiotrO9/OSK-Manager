import { setResponseStatus, type H3Event } from 'h3';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';

export async function bffUpstreamRegister(
    event: H3Event,
    upstreamBase: string,
    body: unknown,
): Promise<unknown> {
    const { response, envelope } = await upstreamRequest<unknown>(
        event,
        upstreamBase,
        {
            path: '/auth/register',
            method: 'POST',
            body: body ?? {},
            fallbackError: 'Nie udało się utworzyć konta instruktora',
            clearCookiesOnUnauthorized: 'access',
        },
    );

    setResponseStatus(event, response.status);

    return envelope;
}
