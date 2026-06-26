import type { H3Event } from 'h3';
import { upstreamRequest } from '~~/server/utils/upstream/upstreamRequest';

export async function bffUpstreamStudentsList(
    event: H3Event,
    upstreamBase: string,
    params: {
        schoolId: string;
        page: number;
        limit: number;
        courseId?: string;
    },
): Promise<{ success: true; data: unknown }> {
    const query: Record<string, string | number | undefined> = {
        schoolId: params.schoolId,
        page: params.page,
        limit: params.limit,
    };

    if (params.courseId !== undefined && params.courseId.trim().length > 0) {
        query.courseId = params.courseId.trim();
    }

    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: '/students',
        query,
        fallbackError: 'Nie udało się pobrać listy kursantów',
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamStudentDetail(
    event: H3Event,
    upstreamBase: string,
    userId: string,
    schoolId: string,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/students/${encodeURIComponent(userId)}`,
        query: { schoolId: schoolId.trim() },
        fallbackError: 'Nie udało się pobrać danych kursanta',
    });

    return {
        success: true,
        data,
    };
}

/**
 * GET {upstream}/students/:userId/events - wydarzenia przypisane do kursanta.
 * Opcjonalny query (np. dateFrom, dateTo) przekazywany bez zmian, jeśli backend wspiera.
 */
export async function bffUpstreamStudentEvents(
    event: H3Event,
    upstreamBase: string,
    userId: string,
    queryString?: string,
): Promise<{ success: true; data: unknown }> {
    const suffix = queryString?.trim() ?? '';
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/students/${encodeURIComponent(userId)}/events${suffix ? `?${suffix}` : ''}`,
        fallbackError: 'Nie udało się pobrać wydarzeń kursanta',
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamStudentProcessStatus(
    event: H3Event,
    upstreamBase: string,
    userId: string,
    schoolId: string,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/students/${encodeURIComponent(userId)}/process-status`,
        query: { schoolId: schoolId.trim() },
        fallbackError: 'Nie udało się pobrać statusu procesu kursanta',
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamUpdateStudentNotes(
    event: H3Event,
    upstreamBase: string,
    userId: string,
    notes: string | null,
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/students/${encodeURIComponent(userId)}`,
        method: 'PATCH',
        body: { notes },
        fallbackError: 'Nie udało się zapisać notatki kursanta',
    });

    return {
        success: true,
        data,
    };
}

export async function bffUpstreamStudentAssignToCourse(
    event: H3Event,
    upstreamBase: string,
    studentUserId: string,
    body: { courseId: string },
): Promise<{ success: true; data: unknown }> {
    const { data } = await upstreamRequest<unknown>(event, upstreamBase, {
        path: `/students/${encodeURIComponent(studentUserId)}/courses`,
        method: 'POST',
        body: { courseId: body.courseId },
        fallbackError: 'Nie udało się zapisać kursanta na kurs',
    });

    return {
        success: true,
        data,
    };
}
