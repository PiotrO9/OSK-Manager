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
import {
    buildCreateInstructorEventRequestBody,
    buildPatchInstructorEventRequestBody,
    buildTheoryEventEligibleStudentsQuery,
    isTheoryInstructorEvent,
    type EventStudentsPayload,
    type TheoryEventEligibleStudentsPayload,
} from '~/utils/events/instructorEventsApiRequests';
import { normalizeInstructorEventFromApi } from '~/utils/events/instructorEventNormalize';
import { normalizeTheoryEventEligibleStudents } from '~/utils/events/theoryEventEligibleStudents';

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
            const body = buildCreateInstructorEventRequestBody(payload);

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
                isTheoryInstructorEvent(rawEvent) &&
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
            const body = buildPatchInstructorEventRequestBody(payload);

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

        const query = buildTheoryEventEligibleStudentsQuery(opts);

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
