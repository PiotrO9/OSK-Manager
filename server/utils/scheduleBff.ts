import type { H3Event } from 'h3';

interface BackendEnvelope<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

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

export async function bffScheduleMeGet(
    event: H3Event,
    upstreamBase: string,
    queryString: string,
): Promise<{ success: true; data: { items: ScheduleItemResponse[] } }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostępu' });
    }

    const res = await fetch(`${upstreamBase}/schedule/me?${queryString}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
        },
    });

    const json = (await res.json()) as BackendEnvelope<{
        items: ScheduleItemResponse[];
    }>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się pobrać terminarza',
        });
    }

    const data = json.data ?? { items: [] };
    const items = Array.isArray(data.items) ? data.items : [];

    return {
        success: true,
        data: { items },
    };
}

export async function bffScheduleManagerGet(
    event: H3Event,
    upstreamBase: string,
    queryString: string,
): Promise<{ success: true; data: { items: ScheduleItemResponse[] } }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({ statusCode: 401, message: 'Brak tokena dostępu' });
    }

    const res = await fetch(`${upstreamBase}/schedule?${queryString}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
        },
    });

    const json = (await res.json()) as BackendEnvelope<{
        items: ScheduleItemResponse[];
    }>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się pobrać terminarza',
        });
    }

    const data = json.data ?? { items: [] };
    const items = Array.isArray(data.items) ? data.items : [];

    return {
        success: true,
        data: { items },
    };
}
