import type { H3Event } from 'h3';
import { upstreamRequest } from '~~/server/utils/upstreamRequest';

export async function bffUpstreamInstructorsList(
    event: H3Event,
    upstreamBase: string,
    schoolId: string,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: '/instructors',
        query: { schoolId },
        fallbackError: 'Nie udało się pobrać listy instruktorów',
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamInstructorsGetById(
    event: H3Event,
    upstreamBase: string,
    id: string,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/instructors/${encodeURIComponent(id)}`,
        fallbackError: 'Nie udało się pobrać instruktora',
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamInstructorsPatch(
    event: H3Event,
    upstreamBase: string,
    id: string,
    body: Record<string, unknown>,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/instructors/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
        fallbackError: 'Nie udało się zaktualizować instruktora',
    });

    return {
        success: true,
        data,
    };
}

/**
 * Soft delete instruktora - upstream zwraca 204 bez body.
 */
export async function bffUpstreamInstructorsDelete(
    event: H3Event,
    upstreamBase: string,
    id: string,
): Promise<{ success: true }> {
    await upstreamRequest(event, upstreamBase, {
        path: `/instructors/${encodeURIComponent(id)}`,
        method: 'DELETE',
        fallbackError: 'Nie udało się usunąć instruktora',
        notFoundHtmlError: 'Instruktor nie istnieje.',
        allowEmptySuccess: true,
    });

    return { success: true };
}
