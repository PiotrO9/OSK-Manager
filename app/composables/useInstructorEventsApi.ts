import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import {
    assertBooleanSuccessEnvelope,
    getApiErrorStatusCode,
    unwrapApiSuccessData,
} from '~/utils/apiEnvelope';
import {
    extractStudentAttendanceFromEvent,
    extractStudentUserIdsFromEventStudentsPayload,
} from '~/utils/instructorEventStudents';
import type { InstructorListItem } from '~/types/instructor';
import type {
    CreateInstructorEventPayload,
    InstructorEvent,
    PatchInstructorEventPayload,
} from '~/types/instructorEvent';

/**
 * BE często zwraca `instructor: { id }` / `vehicle: { id }` zamiast samych `instructorId` / `vehicleId`
 * (jak GET /lessons/:id). Bez tego UI wywołuje `.trim()` na undefined.
 */
function readInstructorIdFromEventRaw(o: Record<string, unknown>): string {
    const direct = o.instructorId;

    if (typeof direct === 'string' && direct.trim()) {
        return direct.trim();
    }

    const inst = o.instructor;

    if (inst && typeof inst === 'object') {
        const id = (inst as Record<string, unknown>).id;

        if (typeof id === 'string' && id.trim()) {
            return id.trim();
        }
    }

    return '';
}

function readCourseIdFromEventRaw(
    o: Record<string, unknown>,
): string | null | undefined {
    if (!('courseId' in o) && !('course_id' in o)) {
        return undefined;
    }

    const val =
        'courseId' in o && o.courseId !== undefined ? o.courseId : o.course_id;

    if (val === null) {
        return null;
    }

    if (typeof val === 'string') {
        const t = val.trim();

        return t.length > 0 ? t : null;
    }

    return null;
}

function readVehicleIdFromEventRaw(o: Record<string, unknown>): string | null {
    if (o.vehicleId === null) {
        return null;
    }

    if (typeof o.vehicleId === 'string') {
        const t = o.vehicleId.trim();

        return t.length > 0 ? t : null;
    }

    const veh = o.vehicle;

    if (veh && typeof veh === 'object') {
        const id = (veh as Record<string, unknown>).id;

        if (typeof id === 'string' && id.trim()) {
            return id.trim();
        }
    }

    return null;
}

/** Jak GET /lessons/:id — pole `instructor` zagnieżdżone zamiast osobnego GET. */
function readNestedInstructorListItem(raw: unknown): InstructorListItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = typeof o.id === 'string' ? o.id.trim() : '';

    if (!id) {
        return null;
    }

    const firstName =
        typeof o.firstName === 'string'
            ? o.firstName.trim()
            : typeof o.first_name === 'string'
              ? o.first_name.trim()
              : '';
    const lastName =
        typeof o.lastName === 'string'
            ? o.lastName.trim()
            : typeof o.last_name === 'string'
              ? o.last_name.trim()
              : '';
    const email =
        typeof o.email === 'string'
            ? o.email.trim()
            : typeof o.Email === 'string'
              ? o.Email.trim()
              : '';

    return { id, firstName, lastName, email };
}

function normalizeInstructorEventFromApi(raw: unknown): InstructorEvent {
    if (!raw || typeof raw !== 'object') {
        throw new Error('Nieprawidłowa odpowiedź serwera');
    }

    const o = raw as Record<string, unknown>;
    const base = raw as InstructorEvent;

    const instructorId = readInstructorIdFromEventRaw(o);
    const vehicleId = readVehicleIdFromEventRaw(o);
    const courseIdResolved = readCourseIdFromEventRaw(o);
    const startTime =
        typeof o.startTime === 'string'
            ? o.startTime
            : typeof base.startTime === 'string'
              ? base.startTime
              : '';
    const endTime =
        typeof o.endTime === 'string'
            ? o.endTime
            : typeof base.endTime === 'string'
              ? base.endTime
              : '';

    const eventInstructor = readNestedInstructorListItem(o.instructor);

    return {
        ...base,
        instructorId,
        vehicleId,
        startTime,
        endTime,
        ...(eventInstructor ? { eventInstructor } : {}),
        ...(courseIdResolved !== undefined
            ? { courseId: courseIdResolved }
            : {}),
    };
}

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
    const isDeleteLoading = ref(false);

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

            if (payload.type === 'THEORY' && payload.courseId?.trim()) {
                body.courseId = payload.courseId.trim();
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

            const rawEvent = normalizeInstructorEventFromApi(data.event);
            const att = extractStudentAttendanceFromEvent(rawEvent);

            let mergedIds = att.ids;
            let known = att.source === 'present';

            /**
             * Dla teorii zawsze pytamy o `GET /events/:id/students`. Główny GET
             * `/events/:id` często zwraca `studentUserIds: []` (pole „obecne”),
             * co wcześniej blokowało ten fetch — wtedy checkboxy były puste mimo
             * realnych przypisań w podzasobie.
             */
            if (isTheoryEventType(rawEvent)) {
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

            return normalizeInstructorEventFromApi(data.event);
        } finally {
            isUpdateLoading.value = false;
        }
    }

    async function deleteInstructorEvent(id: string): Promise<void> {
        const eid = id.trim();

        if (!eid) {
            throw new Error('Brak identyfikatora wydarzenia.');
        }

        isDeleteLoading.value = true;

        try {
            const raw = await $fetch<unknown>(
                resolveBffEndpoint(`/api/events/${encodeURIComponent(eid)}`),
                {
                    method: 'DELETE',
                    credentials: 'include',
                },
            );

            assertBooleanSuccessEnvelope(raw);
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
        updateInstructorEvent,
        deleteInstructorEvent,
    };
}
