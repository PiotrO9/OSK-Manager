import {
    assertBooleanSuccessEnvelope,
    getApiErrorStatusCode,
} from '~/utils/apiEnvelope';
import {
    extractStudentAttendanceFromEvent,
    extractStudentUserIdsFromEventStudentsPayload,
} from '~/utils/instructorEventStudents';
import type { InstructorListItem } from '~/types/instructor';
import type {
    CreateInstructorEventPayload,
    FreeWindow,
    InstructorEvent,
    InstructorEventStudent,
    PatchInstructorEventPayload,
    TheoryEventEligibleStudentsData,
} from '~/types/instructorEvent';
import type { paths } from '~/types/generated/api';
import { normalizeTheoryEventEligibleStudents } from '~/utils/theoryEventEligibleStudents';

type ApiSuccessData<T> = T extends { success: true; data: infer Data }
    ? Data
    : never;
type EventCreateResponse =
    paths['/events']['post']['responses'][201]['content']['application/json'];
type EventGetResponse =
    paths['/events/{id}']['get']['responses'][200]['content']['application/json'];
type EventPatchResponse =
    paths['/events/{id}']['patch']['responses'][200]['content']['application/json'];
type EventCreateApiData = ApiSuccessData<EventCreateResponse>;
type EventGetApiData = ApiSuccessData<EventGetResponse>;
type EventPatchApiData = ApiSuccessData<EventPatchResponse>;

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

function readEventStatusFromRaw(
    o: Record<string, unknown>,
): string | undefined {
    if (!('status' in o)) {
        return undefined;
    }

    const s = o.status;

    if (typeof s !== 'string') {
        return undefined;
    }

    const t = s.trim();

    return t.length > 0 ? t : undefined;
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
    let phone: string | null | undefined;

    if (o.phone === null) {
        phone = null;
    } else if (typeof o.phone === 'string') {
        const p = o.phone.trim();

        phone = p.length > 0 ? p : null;
    }

    return {
        id,
        firstName,
        lastName,
        email,
        ...(phone !== undefined ? { phone } : {}),
    };
}

/** GET /events/:id — `students` jak przy GET /lessons/:id (StudentProfile + kontakt). */
function readNestedEventStudents(
    raw: unknown,
): InstructorEventStudent[] | undefined {
    if (!Array.isArray(raw)) {
        return undefined;
    }

    const out: InstructorEventStudent[] = [];

    for (const item of raw) {
        if (!item || typeof item !== 'object') {
            continue;
        }

        const o = item as Record<string, unknown>;
        const id =
            typeof o.id === 'string'
                ? o.id.trim()
                : o.student_id != null
                  ? String(o.student_id).trim()
                  : '';

        if (!id) {
            continue;
        }

        const userIdRaw =
            o.userId ?? o.user_id ?? o.studentUserId ?? o.student_user_id;
        const userId =
            typeof userIdRaw === 'string'
                ? userIdRaw.trim()
                : userIdRaw != null
                  ? String(userIdRaw).trim()
                  : '';

        if (!userId) {
            continue;
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

        let phone: string | null = null;

        if (o.phone === null) {
            phone = null;
        } else if (typeof o.phone === 'string') {
            const p = o.phone.trim();

            phone = p.length > 0 ? p : null;
        }

        out.push({
            id,
            userId,
            firstName,
            lastName,
            email,
            phone,
        });
    }

    return out;
}

function readFreeWindowsFromRaw(
    o: Record<string, unknown>,
): FreeWindow[] | undefined {
    const raw = o.freeWindows;

    if (!Array.isArray(raw)) {
        return undefined;
    }

    const out: FreeWindow[] = [];

    for (const item of raw) {
        if (!item || typeof item !== 'object') {
            continue;
        }

        const w = item as Record<string, unknown>;
        const startTime =
            typeof w.startTime === 'string'
                ? w.startTime.trim()
                : typeof w.start_time === 'string'
                  ? w.start_time.trim()
                  : '';
        const endTime =
            typeof w.endTime === 'string'
                ? w.endTime.trim()
                : typeof w.end_time === 'string'
                  ? w.end_time.trim()
                  : '';

        if (startTime && endTime) {
            out.push({ startTime, endTime });
        }
    }

    return out;
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
    const eventStudents =
        'students' in o ? readNestedEventStudents(o.students) : undefined;
    const freeWindowsResolved = readFreeWindowsFromRaw(o);
    const statusResolved = readEventStatusFromRaw(o);

    return {
        ...base,
        instructorId,
        vehicleId,
        startTime,
        endTime,
        ...(statusResolved !== undefined ? { status: statusResolved } : {}),
        ...(eventInstructor ? { eventInstructor } : {}),
        ...(courseIdResolved !== undefined
            ? { courseId: courseIdResolved }
            : {}),
        ...(eventStudents !== undefined ? { students: eventStudents } : {}),
        ...(freeWindowsResolved !== undefined
            ? { freeWindows: freeWindowsResolved }
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

            const data = await requestBffData<EventCreateApiData>(
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
            const payload = await requestBffData<unknown>(
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
            const data = await requestBffData<EventGetApiData>(
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

            /**
             * Gdy GET `/events/:id` nie zawiera pól o kursantach (`source === 'unknown'`),
             * dla teorii dociągamy `GET /events/:id/students` (users.id).
             * Obecny BE zwraca zawsze `students` (pełne obiekty) — wtedy `extractStudentAttendanceFromEvent`
             * ustala listę userId bez drugiego żądania.
             * `skipTheoryStudentsSubresource` — np. widok bez listy kursantów.
             */
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

            const data = await requestBffData<EventPatchApiData>(
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

        const data = await requestBffData<unknown>(
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
            const raw = await bffFetch<unknown>(
                'DELETE',
                `/api/events/${encodeURIComponent(eid)}`,
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
        fetchTheoryEventEligibleStudents,
        updateInstructorEvent,
        deleteInstructorEvent,
    };
}
