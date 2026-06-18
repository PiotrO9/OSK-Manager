/** Lekcja w odpowiedzi GET /schedule, GET /schedule/me (BE ScheduleItemDto). */

export type LessonTypeCode = 'THEORY' | 'PRACTICE';

export interface SchedulePersonRef {
    id: string;
    firstName: string;
    lastName: string;
}

export interface ScheduleVehicleRef {
    id: string;
    name: string;
    registrationNumber: string;
}

export interface ScheduleLessonRating {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
}

export interface ScheduleLessonItem {
    id: string;
    /** `lesson` | `instructor_event` — z BE GET /schedule (opcjonalnie w odpowiedzi). */
    kind?: string;
    type: LessonTypeCode | string;
    status: string;
    startTime: string;
    endTime: string;
    instructor?: SchedulePersonRef;
    student?: SchedulePersonRef;
    vehicle?: ScheduleVehicleRef;
    rating?: ScheduleLessonRating | null;
    /** Tylko eventy instruktora (np. zajęcia grupowe). */
    capacity?: number | null;
    participantCount?: number | null;
    students?: SchedulePersonRef[];
}
