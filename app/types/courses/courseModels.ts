import type { CourseTypeOption } from '~/types/courses/courseType';
import type { CourseKind } from '~~/shared/contracts/courses';

export type { CourseKind } from '~~/shared/contracts/courses';

export type CourseParticipantStatus = 'ACTIVE' | 'FINISHED';

/** Body POST `/api/courses` (BFF → BE) — pola opcjonalne wg `kind`. */
export interface CourseCreatePayload {
    schoolId: string;
    name: string;
    category: string;
    kind: CourseKind;
    totalHours: number;
    capacity?: number | null;
    instructorId?: string | null;
    theoryStartDate?: string | null;
    theoryEndDate?: string | null;
}

export interface CourseInstructorRef {
    id: string;
    name: string;
    avatarUrl: string | null;
}

export interface CourseListItem {
    id: string;
    name: string;
    category: string;
    courseType: CourseTypeOption | null;
    type: CourseKind;
    totalHours: number;
    instructor: CourseInstructorRef | null;
}

export interface CurrentUserCourseItem {
    id: string;
    schoolId: string;
    name: string;
    status: CourseParticipantStatus;
    type: CourseKind;
    totalHours: number;
    progress: number;
}

/** Szczegóły kursu (GET `/courses/:id`) — `capacity` może być null (brak limitu). */
export interface CourseDetail extends CourseListItem {
    capacity: number | null;
    hasActivity?: boolean;
    theoryStartDate?: string | null;
    theoryEndDate?: string | null;
    /** Gdy backend / mock zwraca (np. do `GET /instructors?schoolId`). */
    schoolId?: string;
}

/** Body PATCH `/courses/:id` — edycja kursu lub zmiana instruktora. */
export interface CoursePatchInstructorPayload {
    instructorId: string | null;
}

export interface CoursePatchPayload {
    instructorId?: string | null;
    name?: string;
    category?: string;
    kind?: CourseKind;
    totalHours?: number;
    capacity?: number | null;
    theoryStartDate?: string | null;
    theoryEndDate?: string | null;
}
