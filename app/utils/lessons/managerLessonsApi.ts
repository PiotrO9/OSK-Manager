import type { InstructorListItem } from '~/types/instructors/instructor';
import { readAvatarUrlFromRecord } from '~/types/profileAvatar';
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

    const responseRecord = raw as Record<string, unknown>;
    const id = responseRecord.id;

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

    const lessonRecord = raw as Record<string, unknown>;

    const id = readStringField(lessonRecord, 'id');
    const courseId = readAliasedStringField(
        lessonRecord,
        'courseId',
        'course_id',
    );
    const schoolId = readAliasedStringField(
        lessonRecord,
        'schoolId',
        'school_id',
    );
    const studentId =
        readAliasedStringField(lessonRecord, 'studentId', 'student_id') ||
        readManagerLessonIdFromNestedObject(lessonRecord.student);
    const studentUserId = readNestedManagerLessonUserId(lessonRecord.student);
    const instructorId =
        readAliasedStringField(lessonRecord, 'instructorId', 'instructor_id') ||
        readManagerLessonIdFromNestedObject(lessonRecord.instructor);
    const lessonType = readAliasedStringField(
        lessonRecord,
        'lessonType',
        'lesson_type',
    );
    const startTime = readAliasedStringField(
        lessonRecord,
        'startTime',
        'start_time',
    );
    const endTime = readAliasedStringField(lessonRecord, 'endTime', 'end_time');
    const status = readStringField(lessonRecord, 'status');
    const vehicleId = readManagerLessonVehicleId(lessonRecord);

    if (!id || !courseId || !startTime || !endTime || !status) {
        return null;
    }

    const student = readNestedManagerLessonStudent(lessonRecord);
    const assignedCourseInstructor = readNestedAssignedCourseInstructor(
        lessonRecord.assignedCourseInstructor,
    );

    let lessonInstructor = readNestedManagerLessonInstructorItem(
        lessonRecord.instructor,
    );

    if (
        lessonInstructor &&
        instructorId &&
        lessonInstructor.id !== instructorId
    ) {
        lessonInstructor = null;
    }

    let lessonVehicle: Vehicle | null = readNestedManagerLessonVehicleItem(
        lessonRecord.vehicle,
    );

    if (lessonVehicle && vehicleId && lessonVehicle.id !== vehicleId) {
        lessonVehicle = null;
    }

    return {
        id,
        courseId,
        ...(schoolId ? { schoolId } : {}),
        studentId,
        ...(studentUserId ? { studentUserId } : {}),
        instructorId,
        vehicleId,
        lessonType: lessonType || 'PRACTICE',
        startTime,
        endTime,
        status,
        ...(student ? { student } : {}),
        ...(lessonInstructor ? { lessonInstructor } : {}),
        ...(lessonVehicle ? { lessonVehicle } : {}),
        ...(assignedCourseInstructor ? { assignedCourseInstructor } : {}),
        ...(typeof lessonRecord.bookingMaxDaysAhead === 'number' &&
        Number.isInteger(lessonRecord.bookingMaxDaysAhead) &&
        lessonRecord.bookingMaxDaysAhead >= 0
            ? { bookingMaxDaysAhead: lessonRecord.bookingMaxDaysAhead }
            : {}),
        ...(typeof lessonRecord.schoolWorkingDaysMask === 'number' &&
        Number.isInteger(lessonRecord.schoolWorkingDaysMask) &&
        lessonRecord.schoolWorkingDaysMask >= 0 &&
        lessonRecord.schoolWorkingDaysMask <= 127
            ? { schoolWorkingDaysMask: lessonRecord.schoolWorkingDaysMask }
            : {}),
    };
}

/** PATCH zwraca tylko identyfikatory; zachowaj dane opisowe z GET dla niezmienionych relacji. */
export function mergeManagerLessonAfterUpdate(
    previous: ManagerLessonDetail,
    updated: ManagerLessonDetail,
): ManagerLessonDetail {
    return {
        ...updated,
        schoolId: updated.schoolId ?? previous.schoolId,
        bookingMaxDaysAhead:
            updated.bookingMaxDaysAhead ?? previous.bookingMaxDaysAhead,
        schoolWorkingDaysMask:
            updated.schoolWorkingDaysMask ?? previous.schoolWorkingDaysMask,
        ...(updated.studentId === previous.studentId
            ? {
                  student: updated.student ?? previous.student,
                  studentUserId:
                      updated.studentUserId ?? previous.studentUserId,
              }
            : {}),
        ...(updated.instructorId === previous.instructorId
            ? {
                  lessonInstructor:
                      updated.lessonInstructor ?? previous.lessonInstructor,
              }
            : {}),
        ...(updated.vehicleId === previous.vehicleId
            ? { lessonVehicle: updated.lessonVehicle ?? previous.lessonVehicle }
            : {}),
        assignedCourseInstructor:
            updated.assignedCourseInstructor ??
            previous.assignedCourseInstructor,
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

function readStringField(
    lessonRecord: Record<string, unknown>,
    field: string,
): string {
    const value = lessonRecord[field];

    return typeof value === 'string' ? value.trim() : '';
}

function readAliasedStringField(
    lessonRecord: Record<string, unknown>,
    camelField: string,
    snakeField: string,
): string {
    return (
        readStringField(lessonRecord, camelField) ||
        readStringField(lessonRecord, snakeField)
    );
}

function readManagerLessonVehicleId(
    lessonRecord: Record<string, unknown>,
): string | null {
    if (lessonRecord.vehicleId === null || lessonRecord.vehicle_id === null) {
        return null;
    }

    const flat =
        readStringField(lessonRecord, 'vehicleId') ||
        readStringField(lessonRecord, 'vehicle_id');

    if (flat) {
        return flat;
    }

    const nested = readManagerLessonIdFromNestedObject(lessonRecord.vehicle);

    return nested.length > 0 ? nested : null;
}

function readNestedManagerLessonInstructorItem(
    raw: unknown,
): InstructorListItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const lessonRecord = raw as Record<string, unknown>;
    const id = readManagerLessonIdFromNestedObject(raw);

    if (!id) {
        return null;
    }

    return {
        id,
        firstName: readAliasedStringField(
            lessonRecord,
            'firstName',
            'first_name',
        ),
        lastName: readAliasedStringField(lessonRecord, 'lastName', 'last_name'),
        email:
            readStringField(lessonRecord, 'email') ||
            (typeof lessonRecord.Email === 'string'
                ? lessonRecord.Email.trim()
                : ''),
        avatarUrl: readAvatarUrlFromRecord(lessonRecord),
    };
}

function readNestedManagerLessonVehicleItem(raw: unknown): Vehicle | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    return normalizeVehicle(raw, 0);
}

function readNestedManagerLessonStudent(
    lessonRecord: Record<string, unknown>,
): { firstName: string; lastName: string } | undefined {
    const raw = lessonRecord.student;

    if (!raw || typeof raw !== 'object') {
        return undefined;
    }

    const studentRecord = raw as Record<string, unknown>;
    const firstName = readStringField(studentRecord, 'firstName');
    const lastName = readStringField(studentRecord, 'lastName');

    if (!firstName && !lastName) {
        return undefined;
    }

    return { firstName, lastName };
}

function readNestedManagerLessonUserId(raw: unknown): string {
    if (!raw || typeof raw !== 'object') {
        return '';
    }

    return readAliasedStringField(
        raw as Record<string, unknown>,
        'userId',
        'user_id',
    );
}

function readNestedAssignedCourseInstructor(
    raw: unknown,
): { id: string; name: string } | null {
    if (!raw || typeof raw !== 'object') return null;

    const item = raw as Record<string, unknown>;
    const id = readStringField(item, 'id');
    const name = readStringField(item, 'name');

    return id && name ? { id, name } : null;
}
