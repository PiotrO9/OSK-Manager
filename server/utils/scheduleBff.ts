import type { H3Event } from 'h3';
import { upstreamRequest } from '~~/server/utils/upstreamRequest';

export interface ScheduleItemResponse {
    id: string;
    kind?: string;
    type: string;
    status: string;
    startTime: string;
    endTime: string;
    instructor?: { id: string; firstName: string; lastName: string };
    student?: { id: string; firstName: string; lastName: string };
    vehicle?: { id: string; name: string; registrationNumber: string };
    rating?: {
        id: string;
        rating: number;
        comment: string | null;
        createdAt: string;
    } | null;
    capacity?: number | null;
    participantCount?: number | null;
    students?: { id: string; firstName: string; lastName: string }[];
}

interface ScheduleData {
    items?: ScheduleItemResponse[];
}

function normalizeScheduleItems(data: ScheduleData | undefined) {
    return Array.isArray(data?.items) ? data.items : [];
}

export async function bffScheduleMeGet(
    event: H3Event,
    upstreamBase: string,
    queryString: string,
): Promise<{ success: true; data: { items: ScheduleItemResponse[] } }> {
    const suffix = queryString.trim();
    const { data } = await upstreamRequest<ScheduleData>(event, upstreamBase, {
        path: `/schedule/me${suffix ? `?${suffix}` : ''}`,
        fallbackError: 'Nie udało się pobrać terminarza',
    });

    return {
        success: true,
        data: { items: normalizeScheduleItems(data) },
    };
}

export async function bffScheduleManagerGet(
    event: H3Event,
    upstreamBase: string,
    queryString: string,
): Promise<{ success: true; data: { items: ScheduleItemResponse[] } }> {
    const suffix = queryString.trim();
    const { data } = await upstreamRequest<ScheduleData>(event, upstreamBase, {
        path: `/schedule${suffix ? `?${suffix}` : ''}`,
        fallbackError: 'Nie udało się pobrać terminarza',
    });

    return {
        success: true,
        data: { items: normalizeScheduleItems(data) },
    };
}
