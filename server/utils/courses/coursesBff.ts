import type { H3Event } from 'h3';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';

export async function bffUpstreamCoursesList(
    event: H3Event,
    upstreamBase: string,
    schoolId: string,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: '/courses',
        query: { schoolId },
        fallbackError: 'Nie udało się pobrać listy kursów',
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamMyCoursesList(
    event: H3Event,
    upstreamBase: string,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: '/me/courses',
        fallbackError: 'Nie udało się pobrać listy kursów użytkownika',
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamCoursesGetById(
    event: H3Event,
    upstreamBase: string,
    id: string,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/courses/${encodeURIComponent(id)}`,
        fallbackError: 'Nie udało się pobrać szczegółów kursu',
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamCoursesCreate(
    event: H3Event,
    upstreamBase: string,
    body: Record<string, unknown>,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: '/courses',
        method: 'POST',
        body,
        fallbackError: 'Nie udało się utworzyć kursu',
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamCoursesPatch(
    event: H3Event,
    upstreamBase: string,
    id: string,
    body: Record<string, unknown>,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/courses/${encodeURIComponent(id)}`,
        method: 'PATCH',
        body,
        fallbackError: 'Nie udało się zaktualizować kursu',
    });

    return {
        success: true,
        data,
    };
}
