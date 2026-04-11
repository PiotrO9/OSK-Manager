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

export interface ScheduleLessonItem {
    id: string;
    type: LessonTypeCode | string;
    status: string;
    startTime: string;
    endTime: string;
    instructor?: SchedulePersonRef;
    student?: SchedulePersonRef;
    vehicle?: ScheduleVehicleRef;
}
