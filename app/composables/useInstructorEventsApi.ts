import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import {
    getApiErrorStatusCode,
    unwrapApiSuccessData,
} from '~/utils/apiEnvelope';
import {
    extractStudentAttendanceFromEvent,
    extractStudentUserIdsFromEventStudentsPayload,
} from '~/utils/instructorEventStudents';
import type {
    CreateInstructorEventPayload,
    InstructorEvent,
    PatchInstructorEventPayload,
} from '~/types/instructorEvent';

function buildPatchRequestBody(
    payload: PatchInstructorEventPayload,
): Record<string, unknown> {
    const body: Record<string, unknown> = {};

    if (payload.instructorId !== undefined) {
        body.instructorId = payload.instructorId.trim();
    }

    if (payload.type !== undefined) {
        body.type = payload.type;
    }

    if (payload.startTime !== undefined) {
        body.startTime = payload.startTime.trim();
    }

    if (payload.endTime !== undefined) {
        body.endTime = payload.endTime.trim();
    }

    if (payload.vehicleId !== undefined) {
        body.vehicleId = payload.vehicleId;
    }

    if (payload.capacity !== undefined) {
        body.capacity = payload.capacity;
    }

    return body;
}

function isTheoryEventType(ev: InstructorEvent): boolean {
    const t = String(ev.type ?? '')
        .trim()
        .toUpperCase();

    return t === 'THEORY';
}

export function useInstructorEventsApi() {
    const isLoading = ref(false);
    const isFetchLoading = ref(false);
    const isUpdateLoading = ref(false);

    async function createInstructorEvent(
        payload: CreateInstructorEventPayload,
    ): Promise<InstructorEvent> {
        isLoading.value = true;

        try {
            const body: Record<string, unknown> = {
                instructorId: payload.instructorId.trim(),
                type: payload.type,
                startTime: payload.startTime.trim(),
                endTime: payload.endTime.trim(),
            };

            if (payload.type === 'DRIVE' && payload.vehicleId?.trim()) {
                body.vehicleId = payload.vehicleId.trim();
            }

            if (payload.capacity !== undefined && payload.capacity !== null) {
                body.capacity = payload.capacity;
            }

            const raw = await $fetch<unknown>(
                resolveBffEndpoint('/api/events'),
                {
                    method: 'POST',
                    credentials: 'include',
                    body,
                },
            );

            const data = unwrapApiSuccessData<{ event: InstructorEvent }>(raw);

            if (!data?.event || typeof data.event !== 'object') {
                throw new Error('Nieprawidłowa odpowiedź serwera');
            }

            return data.event;
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchAssignedStudentUserIdsFromSubresource(
        eventId: string,
    ): Promise<string[] | null> {
        const eid = eventId.trim();

        if (!eid) {
            return null;
        }

        try {
            const raw = await $fetch<unknown>(
                resolveBffEndpoint(
                    `/api/events/${encodeURIComponent(eid)}/students`,
                ),
                {
                    method: 'GET',
                    credentials: 'include',
                },
            );

            const payload = unwrapApiSuccessData<unknown>(raw);

            return extractStudentUserIdsFromEventStudentsPayload(payload);
        } catch (err: unknown) {
            const code = getApiErrorStatusCode(err);

            if (code === 404) {
                return null;
            }

            throw err;
        }
    }

    async function fetchEventById(id: string): Promise<InstructorEvent> {
        const eid = id.trim();

        if (!eid) {
            throw new Error('Brak identyfikatora wydarzenia.');
        }

        isFetchLoading.value = true;

        try {
            const raw = await $fetch<unknown>(
                resolveBffEndpoint(`/api/events/${encodeURIComponent(eid)}`),
                {
                    method: 'GET',
                    credentials: 'include',
                },
            );

            const data = unwrapApiSuccessData<{ event: InstructorEvent }>(raw);

            if (!data?.event || typeof data.event !== 'object') {
                throw new Error('Nieprawidłowa odpowiedź serwera');
            }

            const rawEvent = data.event as InstructorEvent;
            const att = extractStudentAttendanceFromEvent(rawEvent);

            let mergedIds = att.ids;
            let known = att.source === 'present';

            if (!known && isTheoryEventType(rawEvent)) {
                const fromStudentsGet =
                    await fetchAssignedStudentUserIdsFromSubresource(eid);

                if (fromStudentsGet !== null) {
                    mergedIds = fromStudentsGet;
                    known = true;
                }
            }

            if (known) {
                return {
                    ...rawEvent,
                    studentUserIds: mergedIds,
                    studentAttendanceKnown: true,
                };
            }

            return {
                ...rawEvent,
                studentAttendanceKnown: false,
            };
        } finally {
            isFetchLoading.value = false;
        }
    }

    async function updateInstructorEvent(
        id: string,
        payload: PatchInstructorEventPayload,
    ): Promise<InstructorEvent> {
        const eid = id.trim();

        if (!eid) {
            throw new Error('Brak identyfikatora wydarzenia.');
        }

        isUpdateLoading.value = true;

        try {
            const body = buildPatchRequestBody(payload);

            const raw = await $fetch<unknown>(
                resolveBffEndpoint(`/api/events/${encodeURIComponent(eid)}`),
                {
                    method: 'PATCH',
                    credentials: 'include',
                    body,
                },
            );

            const data = unwrapApiSuccessData<{ event: InstructorEvent }>(raw);

            if (!data?.event || typeof data.event !== 'object') {
                throw new Error('Nieprawidłowa odpowiedź serwera');
            }

            return data.event;
        } finally {
            isUpdateLoading.value = false;
        }
    }

    return {
        isLoading: readonly(isLoading),
        isFetchLoading: readonly(isFetchLoading),
        isUpdateLoading: readonly(isUpdateLoading),
        createInstructorEvent,
        fetchEventById,
        updateInstructorEvent,
    };
}
