import { getApiErrorStatusCode } from '~/utils/api/apiEnvelope';
import {
    extractStudentAttendanceFromEvent,
    extractStudentUserIdsFromEventStudentsPayload,
} from '~/utils/events/instructorEventStudents';
import type {
    CreateInstructorEventPayload,
    InstructorEvent,
    PatchInstructorEventPayload,
    TheoryEventEligibleStudentsData,
} from '~/types/events/instructorEvent';
import type {
    InstructorEventCreateApiData,
    InstructorEventGetApiData,
    InstructorEventPatchApiData,
} from '~/types/events/instructorEventApi';
import { normalizeInstructorEventFromApi } from '~/utils/events/instructorEventNormalize';
import { normalizeTheoryEventEligibleStudents } from '~/utils/events/theoryEventEligibleStudents';

interface InstructorEventCreateRequestBody {
    instructorId: string;
    type: CreateInstructorEventPayload['type'];
    startTime: string;
    endTime: string;
    vehicleId?: string;
    capacity?: number;
    courseId?: string;
}

type InstructorEventPatchRequestBody = Partial<{
    instructorId: string;
    type: PatchInstructorEventPayload['type'];
    startTime: string;
    endTime: string;
    vehicleId: string | null;
    capacity: number | null;
    status: NonNullable<PatchInstructorEventPayload['status']>;
}>;

function buildPatchRequestBody(
    payload: PatchInstructorEventPayload,
): InstructorEventPatchRequestBody {
    const body: InstructorEventPatchRequestBody = {};

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

    if (payload.status !== undefined) {
        body.status = payload.status;
    }

    return body;
}

function isTheoryEventType(ev: InstructorEvent): boolean {
    const t = String(ev.type ?? '')
        .trim()
        .toUpperCase();

    return t === 'THEORY';
}

type EventStudentsPayload =
    | string[]
    | Array<Record<string, unknown>>
    | {
          data?: unknown;
          studentUserIds?: unknown;
          studentIds?: unknown;
          assignedStudentIds?: unknown;
          students?: unknown;
          items?: unknown;
          participants?: unknown;
      }
    | null;

type TheoryEventEligibleStudentsPayload = TheoryEventEligibleStudentsData;

export function useInstructorEventsApi() {
    const isLoading = ref(false);
    const isFetchLoading = ref(false);
    const isUpdateLoading = ref(false);
    const isDeleteLoading = ref(false);

    async function createInstructorEvent(
        payload: CreateInstructorEventPayload,
    ): Promise<InstructorEvent> {
        isLoading.value = true;

        try {
            const body: InstructorEventCreateRequestBody = {
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

            if (payload.type === 'THEORY' && payload.courseId?.trim()) {
                body.courseId = payload.courseId.trim();
            }

            const data = await requestBffData<InstructorEventCreateApiData>(
                'POST',
                '/api/events',
                {
                    body,
                    fallbackMessage: 'Nie udało się utworzyć wydarzenia.',
                },
            );

            if (!data?.event || typeof data.event !== 'object') {
                throw new Error('Nieprawidłowa odpowiedź serwera');
            }

            return normalizeInstructorEventFromApi(data.event);
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
            const payload = await requestBffData<EventStudentsPayload>(
                'GET',
                `/api/events/${encodeURIComponent(eid)}/students`,
                {
                    fallbackMessage:
                        'Nie udało się pobrać kursantów wydarzenia.',
                },
            );

            return extractStudentUserIdsFromEventStudentsPayload(payload);
        } catch (err: unknown) {
            const code = getApiErrorStatusCode(err);

            if (code === 404) {
                return null;
            }

            throw err;
        }
    }

    async function fetchEventById(
        id: string,
        options?: {
            skipTheoryStudentsSubresource?: boolean;
            includeSlots?: boolean;
        },
    ): Promise<InstructorEvent> {
        const eid = id.trim();

        if (!eid) {
            throw new Error('Brak identyfikatora wydarzenia.');
        }

        isFetchLoading.value = true;

        try {
            const query =
                options?.includeSlots === true ? '?includeSlots=true' : '';
            const data = await requestBffData<InstructorEventGetApiData>(
                'GET',
                `/api/events/${encodeURIComponent(eid)}${query}`,
                {
                    fallbackMessage: 'Nie udało się pobrać wydarzenia.',
                },
            );

            if (!data?.event || typeof data.event !== 'object') {
                throw new Error('Nieprawidłowa odpowiedź serwera');
            }

            const rawEvent = normalizeInstructorEventFromApi(data.event);
            const att = extractStudentAttendanceFromEvent(rawEvent);

            let mergedIds = att.ids;
            let known = att.source === 'present';

            if (
                isTheoryEventType(rawEvent) &&
                !options?.skipTheoryStudentsSubresource &&
                att.source === 'unknown'
            ) {
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

            const data = await requestBffData<InstructorEventPatchApiData>(
                'PATCH',
                `/api/events/${encodeURIComponent(eid)}`,
                {
                    body,
                    fallbackMessage: 'Nie udało się zapisać wydarzenia.',
                },
            );

            if (!data?.event || typeof data.event !== 'object') {
                throw new Error('Nieprawidłowa odpowiedź serwera');
            }

            return normalizeInstructorEventFromApi(data.event);
        } finally {
            isUpdateLoading.value = false;
        }
    }

    async function fetchTheoryEventEligibleStudents(
        eventId: string,
        opts?: { startTime?: string; endTime?: string },
    ): Promise<TheoryEventEligibleStudentsData> {
        const eid = eventId.trim();

        if (!eid) {
            throw new Error('Brak identyfikatora wydarzenia.');
        }

        const start = opts?.startTime?.trim();
        const end = opts?.endTime?.trim();
        const query =
            start && end
                ? `?startTime=${encodeURIComponent(start)}&endTime=${encodeURIComponent(end)}`
                : '';

        const data = await requestBffData<TheoryEventEligibleStudentsPayload>(
            'GET',
            `/api/events/${encodeURIComponent(eid)}/eligible-students${query}`,
            {
                fallbackMessage:
                    'Nie udało się pobrać kursantów dostępnych dla wydarzenia.',
            },
        );
        const normalized = normalizeTheoryEventEligibleStudents(data);

        if (!normalized) {
            throw new Error(
                'Nieprawidłowa odpowiedź serwera (eligible-students).',
            );
        }

        return normalized;
    }

    async function deleteInstructorEvent(id: string): Promise<void> {
        const eid = id.trim();

        if (!eid) {
            throw new Error('Brak identyfikatora wydarzenia.');
        }

        isDeleteLoading.value = true;

        try {
            await requestBffSuccess(
                'DELETE',
                `/api/events/${encodeURIComponent(eid)}`,
                {
                    fallbackMessage: 'Nie udało się usunąć wydarzenia.',
                },
            );
        } catch (err: unknown) {
            if (getApiErrorStatusCode(err) === 404) {
                return;
            }

            throw err;
        } finally {
            isDeleteLoading.value = false;
        }
    }

    return {
        isLoading: readonly(isLoading),
        isFetchLoading: readonly(isFetchLoading),
        isUpdateLoading: readonly(isUpdateLoading),
        isDeleteLoading: readonly(isDeleteLoading),
        createInstructorEvent,
        fetchEventById,
        fetchTheoryEventEligibleStudents,
        updateInstructorEvent,
        deleteInstructorEvent,
    };
}
