import type { H3Event } from 'h3';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';

export async function bffUpstreamMyPaymentsList(
    event: H3Event,
    upstreamBase: string,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: '/me/payments',
        method: 'GET',
        fallbackError: 'Nie udało się pobrać listy opłat użytkownika',
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamStudentPaymentsList(
    event: H3Event,
    upstreamBase: string,
    userId: string,
    schoolId: string,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/students/${encodeURIComponent(userId)}/payments`,
        method: 'GET',
        query: { schoolId: schoolId.trim() },
        fallbackError: 'Nie udało się pobrać listy opłat kursanta',
    });

    return {
        success: true,
        data,
    };
}
