import type { H3Event } from 'h3';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';

export async function bffUpstreamCourseTypesList(
    event: H3Event,
    upstreamBase: string,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: '/course-types',
        fallbackError: 'Nie udało się pobrać katalogu kategorii',
    });

    return {
        success: true,
        data,
    };
}
