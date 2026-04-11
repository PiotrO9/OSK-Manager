import type { H3Event } from 'h3';

interface BackendEnvelope<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export async function bffUpstreamVehiclesList(
    event: H3Event,
    upstreamBase: string,
    schoolId: string,
    timeFilter?: { startTime: string; endTime: string },
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const qs = new URLSearchParams({ schoolId });

    if (timeFilter) {
        qs.set('startTime', timeFilter.startTime);
        qs.set('endTime', timeFilter.endTime);
    }

    const res = await fetch(`${upstreamBase}/vehicles?${qs.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
        },
    });

    const json = (await res.json()) as BackendEnvelope<unknown>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się pobrać listy pojazdów',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export async function bffUpstreamVehiclesGetById(
    event: H3Event,
    upstreamBase: string,
    id: string,
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const res = await fetch(
        `${upstreamBase}/vehicles/${encodeURIComponent(id)}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${access}`,
            },
        },
    );

    const json = (await res.json()) as BackendEnvelope<unknown>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się pobrać pojazdu',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export interface BffVehicleWriteBody {
    schoolId: string;
    name: string;
    registrationNumber: string;
    inspectionDate: string | null;
    insuranceDate: string | null;
    modelYear: number | null;
    mileageKm: number | null;
}

export interface BffVehiclePatchBody {
    name: string;
    registrationNumber: string;
    inspectionDate: string | null;
    insuranceDate: string | null;
    modelYear: number | null;
    mileageKm: number | null;
}

export async function bffUpstreamVehiclesCreate(
    event: H3Event,
    upstreamBase: string,
    body: BffVehicleWriteBody,
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const res = await fetch(`${upstreamBase}/vehicles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify(body),
    });

    const json = (await res.json()) as BackendEnvelope<unknown>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się utworzyć pojazdu',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export async function bffUpstreamVehiclesUpdate(
    event: H3Event,
    upstreamBase: string,
    id: string,
    body: BffVehiclePatchBody,
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const res = await fetch(`${upstreamBase}/vehicles/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify(body),
    });

    const json = (await res.json()) as BackendEnvelope<unknown>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się zaktualizować pojazdu',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}

export async function bffUpstreamVehiclesDelete(
    event: H3Event,
    upstreamBase: string,
    id: string,
): Promise<{ success: true }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const res = await fetch(`${upstreamBase}/vehicles/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access}`,
        },
    });

    if (!res.ok) {
        let errorMessage = 'Nie udało się usunąć pojazdu';

        try {
            const json = (await res.json()) as BackendEnvelope<unknown>;

            if (typeof json.error === 'string') errorMessage = json.error;
        } catch {
            /* ignoruj błąd parsowania */
        }

        throw createError({
            statusCode: res.status || 502,
            statusMessage: errorMessage,
        });
    }

    return { success: true };
}

export async function bffUpstreamVehiclesUploadPhoto(
    event: H3Event,
    upstreamBase: string,
    id: string,
    file: Blob,
    filename: string,
): Promise<{ success: true; data: unknown }> {
    const access = getCookie(event, 'access_token');

    if (!access) {
        throw createError({
            statusCode: 401,
            message: 'Brak tokena dostępu',
        });
    }

    const form = new FormData();

    form.append('file', file, filename);

    const res = await fetch(
        `${upstreamBase}/vehicles/${encodeURIComponent(id)}/photo`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${access}`,
            },
            body: form,
        },
    );

    const json = (await res.json()) as BackendEnvelope<unknown>;

    if (!res.ok || !json.success) {
        throw createError({
            statusCode: res.status || 502,
            statusMessage:
                typeof json.error === 'string'
                    ? json.error
                    : 'Nie udało się przesłać zdjęcia',
        });
    }

    return {
        success: true,
        data: json.data,
    };
}
