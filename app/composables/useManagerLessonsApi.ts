import { resolveBffEndpoint } from '~/utils/bffEndpoint';
import {
    getApiErrorStatusCode,
    unwrapApiSuccessData,
} from '~/utils/apiEnvelope';
import { getApiFetchErrorMessage } from '~/utils/apiFetchErrorMessage';
import type { InstructorListItem } from '~/types/instructor';
import type {
    ManagerLessonDetail,
    PatchManagerLessonPayload,
} from '~/types/managerLesson';
import { normalizeVehicle, type Vehicle } from '~/types/vehicle';

/** GET /lessons/:id często zwraca `instructor` / `vehicle` / `student` jako obiekty z `id` zamiast płaskich pól. */
function readIdFromNestedObject(raw: unknown): string {
    if (!raw || typeof raw !== 'object') {
        return '';
    }

    const r = raw as Record<string, unknown>;
    const id = r.id;

    if (typeof id === 'string') {
        return id.trim();
    }

    if (id != null && typeof id !== 'object') {
        return String(id).trim();
    }

    return '';
}

function readNestedInstructorItem(raw: unknown): InstructorListItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = readIdFromNestedObject(raw);

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

function readNestedVehicleItem(raw: unknown): Vehicle | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    return normalizeVehicle(raw, 0);
}

function readNestedStudent(
    o: Record<string, unknown>,
): { firstName: string; lastName: string } | undefined {
    const raw = o.student;

    if (!raw || typeof raw !== 'object') {
        return undefined;
    }

    const s = raw as Record<string, unknown>;
    const firstName = typeof s.firstName === 'string' ? s.firstName.trim() : '';
    const lastName = typeof s.lastName === 'string' ? s.lastName.trim() : '';

    if (!firstName && !lastName) {
        return undefined;
    }

    return { firstName, lastName };
}

function normalizeManagerLesson(raw: unknown): ManagerLessonDetail | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;

    const id = typeof o.id === 'string' ? o.id.trim() : '';
    const courseId =
        typeof o.courseId === 'string'
            ? o.courseId.trim()
            : typeof o.course_id === 'string'
              ? o.course_id.trim()
              : '';
    let studentId =
        typeof o.studentId === 'string'
            ? o.studentId.trim()
            : typeof o.student_id === 'string'
              ? o.student_id.trim()
              : '';

    if (!studentId) {
        studentId = readIdFromNestedObject(o.student);
    }

    let instructorId =
        typeof o.instructorId === 'string'
            ? o.instructorId.trim()
            : typeof o.instructor_id === 'string'
              ? o.instructor_id.trim()
              : '';

    if (!instructorId) {
        instructorId = readIdFromNestedObject(o.instructor);
    }
    const lessonType =
        typeof o.lessonType === 'string'
            ? o.lessonType.trim()
            : typeof o.lesson_type === 'string'
              ? o.lesson_type.trim()
              : '';
    const startTime =
        typeof o.startTime === 'string'
            ? o.startTime.trim()
            : typeof o.start_time === 'string'
              ? o.start_time.trim()
              : '';
    const endTime =
        typeof o.endTime === 'string'
            ? o.endTime.trim()
            : typeof o.end_time === 'string'
              ? o.end_time.trim()
              : '';
    const status = typeof o.status === 'string' ? o.status.trim() : '';

    let vehicleId: string | null = null;

    if (o.vehicleId === null || o.vehicle_id === null) {
        vehicleId = null;
    } else if (typeof o.vehicleId === 'string') {
        const v = o.vehicleId.trim();

        vehicleId = v.length > 0 ? v : null;
    } else if (typeof o.vehicle_id === 'string') {
        const v = o.vehicle_id.trim();

        vehicleId = v.length > 0 ? v : null;
    }

    if (!vehicleId) {
        const nested = readIdFromNestedObject(o.vehicle);

        vehicleId = nested.length > 0 ? nested : null;
    }

    if (!id || !courseId || !startTime || !endTime || !status) {
        return null;
    }

    const student = readNestedStudent(o);

    let lessonInstructor = readNestedInstructorItem(o.instructor);

    if (
        lessonInstructor &&
        instructorId &&
        lessonInstructor.id !== instructorId
    ) {
        lessonInstructor = null;
    }

    let lessonVehicle: Vehicle | null = readNestedVehicleItem(o.vehicle);

    if (lessonVehicle && vehicleId && lessonVehicle.id !== vehicleId) {
        lessonVehicle = null;
    }

    return {
        id,
        courseId,
        studentId,
        instructorId,
        vehicleId,
        lessonType: lessonType || 'PRACTICE',
        startTime,
        endTime,
        status,
        ...(student ? { student } : {}),
        ...(lessonInstructor ? { lessonInstructor } : {}),
        ...(lessonVehicle ? { lessonVehicle } : {}),
    };
}

function buildPatchBody(
    payload: PatchManagerLessonPayload,
): Record<string, unknown> {
    const body: Record<string, unknown> = {};

    if (payload.startTime !== undefined) {
        body.startTime = payload.startTime.trim();
    }

    if (payload.endTime !== undefined) {
        body.endTime = payload.endTime.trim();
    }

    if (payload.vehicleId !== undefined) {
        body.vehicleId = payload.vehicleId;
    }

    if (payload.instructorId !== undefined) {
        body.instructorId = payload.instructorId.trim();
    }

    return body;
}

export function useManagerLessonsApi() {
    const isFetchLoading = ref(false);
    const isUpdateLoading = ref(false);

    async function fetchLesson(lessonId: string): Promise<ManagerLessonDetail> {
        const id = lessonId.trim();

        if (!id) {
            throw new Error('Brak identyfikatora lekcji.');
        }

        isFetchLoading.value = true;

        try {
            const raw = await $fetch<unknown>(
                resolveBffEndpoint(`/api/lessons/${encodeURIComponent(id)}`),
                {
                    method: 'GET',
                    credentials: 'include',
                },
            );

            const data = unwrapApiSuccessData<{ lesson: unknown }>(raw);

            const normalized = normalizeManagerLesson(data.lesson);

            if (!normalized) {
                throw new Error('Nieprawidłowa odpowiedź serwera (lekcja).');
            }

            return normalized;
        } catch (err: unknown) {
            const msg = getApiFetchErrorMessage(
                err,
                'Nie udało się wczytać lekcji.',
            );
            const out = new Error(msg) as Error & { statusCode?: number };
            const sc = getApiErrorStatusCode(err);

            if (sc !== undefined) {
                out.statusCode = sc;
            }

            throw out;
        } finally {
            isFetchLoading.value = false;
        }
    }

    async function updateLesson(
        lessonId: string,
        payload: PatchManagerLessonPayload,
    ): Promise<ManagerLessonDetail> {
        const id = lessonId.trim();

        if (!id) {
            throw new Error('Brak identyfikatora lekcji.');
        }

        const body = buildPatchBody(payload);

        if (Object.keys(body).length === 0) {
            throw new Error('Brak pól do zapisu.');
        }

        isUpdateLoading.value = true;

        try {
            const raw = await $fetch<unknown>(
                resolveBffEndpoint(`/api/lessons/${encodeURIComponent(id)}`),
                {
                    method: 'PATCH',
                    credentials: 'include',
                    body,
                },
            );

            const data = unwrapApiSuccessData<{ lesson: unknown }>(raw);
            const normalized = normalizeManagerLesson(data.lesson);

            if (!normalized) {
                throw new Error('Nieprawidłowa odpowiedź serwera (lekcja).');
            }

            return normalized;
        } catch (err: unknown) {
            const msg = getApiFetchErrorMessage(
                err,
                'Nie udało się zapisać lekcji.',
            );
            const out = new Error(msg) as Error & { statusCode?: number };
            const sc = getApiErrorStatusCode(err);

            if (sc !== undefined) {
                out.statusCode = sc;
            }

            throw out;
        } finally {
            isUpdateLoading.value = false;
        }
    }

    return {
        isFetchLoading: readonly(isFetchLoading),
        isUpdateLoading: readonly(isUpdateLoading),
        fetchLesson,
        updateLesson,
    };
}
