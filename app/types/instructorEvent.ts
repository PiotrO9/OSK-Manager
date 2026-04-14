import type { InstructorListItem } from './instructor';

/** Event instruktora — POST /events (BE InstructorEventDto). */

export type InstructorEventTypeCode = 'DRIVE' | 'THEORY';

/**
 * Kursant w `data.event.students` z GET /events/:id — jak przy GET /lessons/:id
 * (wg events-schedule-api.md, dane z event_participants).
 */
export interface InstructorEventStudent {
    /** StudentProfile.id */
    id: string;
    /** User.id — identyfikator w PUT/POST/DELETE /events/:id/students */
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
}

export interface InstructorEvent {
    id: string;
    instructorId: string;
    type: InstructorEventTypeCode | string;
    startTime: string;
    endTime: string;
    vehicleId: string | null;
    /** null / brak = bez limitu (MVP). */
    capacity?: number | null;
    createdAt: string;
    /**
     * Z GET /events/:id — zagnieżdżony instruktor (bez osobnego GET /instructors/:id).
     */
    eventInstructor?: InstructorListItem;
    /** Powiązany kurs (GET/POST/PATCH /events) — tylko sensowne przy THEORY. */
    courseId?: string | null;
    /** UUID użytkowników kursantów — gdy GET /events/:id zwraca te pola. */
    studentUserIds?: string[];
    /** true, gdy odpowiedź API zawierała informację o kursantach (lista może być pusta). */
    studentAttendanceKnown?: boolean;
    /**
     * GET /events/:id — pełne obiekty uczestników (jak przy GET /lessons/:id);
     * kolejność jak w GET /events/:id/students (wg event_participants.created_at).
     */
    students?: InstructorEventStudent[];
}

export interface CreateInstructorEventPayload {
    instructorId: string;
    type: InstructorEventTypeCode;
    /** ISO 8601 datetime */
    startTime: string;
    /** ISO 8601 datetime */
    endTime: string;
    /** Wymagane przy type === DRIVE */
    vehicleId?: string;
    /** Opcjonalnie; null / pominięte = bez limitu. */
    capacity?: number | null;
    /**
     * Tylko przy `type === 'THEORY'`: powiązanie z kursem; BE może dopisać
     * uczestników ACTIVE wg capacity.
     */
    courseId?: string;
}

/** GET /events/:id/eligible-students — `data.capacity`. */
export interface TheoryEventEligibleCapacity {
    limit: number | null;
    used: number;
    remaining: number | null;
}

/** GET /events/:id/eligible-students — jeden wiersz listy kursu. */
export interface TheoryEventEligibleStudentRow {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    createdAt: string;
    isAssignedToEvent: boolean;
    hasScheduleConflict: boolean;
    canAssign: boolean;
}

/** GET /events/:id/eligible-students — `data`. */
export interface TheoryEventEligibleStudentsData {
    courseId: string;
    capacity: TheoryEventEligibleCapacity;
    students: TheoryEventEligibleStudentRow[];
}

/** PATCH /events/:id — wszystkie pola opcjonalne (merge po stronie backendu). */
export interface PatchInstructorEventPayload {
    instructorId?: string;
    type?: InstructorEventTypeCode;
    /** ISO 8601 datetime */
    startTime?: string;
    /** ISO 8601 datetime */
    endTime?: string;
    vehicleId?: string | null;
    capacity?: number | null;
}
