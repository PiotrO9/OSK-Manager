import type { InstructorListItem } from '~/types/instructors/instructor';
import type {
    ManagerLessonDetail,
    PatchManagerLessonPayload,
} from '~/types/lessons/managerLesson';
import { normalizeVehicle, type Vehicle } from '~/types/vehicles/vehicle';

/** GET /lessons/:id często zwraca `instructor` / `vehicle` / `student` jako obiekty z `id` zamiast płaskich pól. */
export function readManagerLessonIdFromNestedObject(raw: unknown): string {
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

export function normalizeManagerLesson(
    raw: unknown,
): ManagerLessonDetail | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;

    const id = readStringField(o, 'id');
    const courseId = readAliasedStringField(o, 'courseId', 'course_id');
    const studentId =
        readAliasedStringField(o, 'studentId', 'student_id') ||
        readManagerLessonIdFromNestedObject(o.student);
    const instructorId =
        readAliasedStringField(o, 'instructorId', 'instructor_id') ||
        readManagerLessonIdFromNestedObject(o.instructor);
    const lessonType = readAliasedStringField(o, 'lessonType', 'lesson_type');
    const startTime = readAliasedStringField(o, 'startTime', 'start_time');
    const endTime = readAliasedStringField(o, 'endTime', 'end_time');
    const status = readStringField(o, 'status');
    const vehicleId = readManagerLessonVehicleId(o);

    if (!id || !courseId || !startTime || !endTime || !status) {
        return null;
    }

    const student = readNestedManagerLessonStudent(o);

    let lessonInstructor = readNestedManagerLessonInstructorItem(o.instructor);

    if (
        lessonInstructor &&
        instructorId &&
        lessonInstructor.id !== instructorId
    ) {
        lessonInstructor = null;
    }

    let lessonVehicle: Vehicle | null = readNestedManagerLessonVehicleItem(
        o.vehicle,
    );

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

export function buildManagerLessonPatchBody(
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

function readStringField(o: Record<string, unknown>, field: string): string {
    const value = o[field];

    return typeof value === 'string' ? value.trim() : '';
}

function readAliasedStringField(
    o: Record<string, unknown>,
    camelField: string,
    snakeField: string,
): string {
    return readStringField(o, camelField) || readStringField(o, snakeField);
}

function readManagerLessonVehicleId(o: Record<string, unknown>): string | null {
    if (o.vehicleId === null || o.vehicle_id === null) {
        return null;
    }

    const flat =
        readStringField(o, 'vehicleId') || readStringField(o, 'vehicle_id');

    if (flat) {
        return flat;
    }

    const nested = readManagerLessonIdFromNestedObject(o.vehicle);

    return nested.length > 0 ? nested : null;
}

function readNestedManagerLessonInstructorItem(
    raw: unknown,
): InstructorListItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = readManagerLessonIdFromNestedObject(raw);

    if (!id) {
        return null;
    }

    return {
        id,
        firstName: readAliasedStringField(o, 'firstName', 'first_name'),
        lastName: readAliasedStringField(o, 'lastName', 'last_name'),
        email:
            readStringField(o, 'email') ||
            (typeof o.Email === 'string' ? o.Email.trim() : ''),
    };
}

function readNestedManagerLessonVehicleItem(raw: unknown): Vehicle | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    return normalizeVehicle(raw, 0);
}

function readNestedManagerLessonStudent(
    o: Record<string, unknown>,
): { firstName: string; lastName: string } | undefined {
    const raw = o.student;

    if (!raw || typeof raw !== 'object') {
        return undefined;
    }

    const s = raw as Record<string, unknown>;
    const firstName = readStringField(s, 'firstName');
    const lastName = readStringField(s, 'lastName');

    if (!firstName && !lastName) {
        return undefined;
    }

    return { firstName, lastName };
}
