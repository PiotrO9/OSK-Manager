export type ScheduleAvailabilityIssueCode =
    | 'DURATION_TOO_SHORT'
    | 'DURATION_TOO_LONG'
    | 'INSTRUCTOR_BUSY'
    | 'OUTSIDE_INSTRUCTOR_HOURS'
    | 'INSTRUCTOR_NOT_ELIGIBLE'
    | 'PARTICIPANT_BUSY'
    | 'STUDENT_BUSY'
    | 'STUDENT_NOT_ELIGIBLE'
    | 'COURSE_LIMIT_EXCEEDED'
    | 'DATE_NOT_BOOKABLE'
    | 'VEHICLE_UNAVAILABLE'
    | 'VEHICLE_BUSY'
    | 'NO_VEHICLE_AVAILABLE'
    | 'COURSE_NOT_ELIGIBLE';

export interface EventCreateAvailabilityRequest {
    intent: 'event_create';
    instructorId: string;
    eventType: 'DRIVE' | 'THEORY';
    date: string;
    startTime: string;
    endTime: string;
    vehicleId?: string;
    courseId?: string;
}

export interface EventEditAvailabilityRequest {
    intent: 'event_edit';
    eventId: string;
    instructorId: string;
    date: string;
    startTime: string;
    endTime: string;
    vehicleId?: string;
}

export interface LessonEditAvailabilityRequest {
    intent: 'lesson_edit';
    lessonId: string;
    instructorId: string;
    vehicleId: string;
    date: string;
    startTime: string;
    endTime: string;
}

export interface LessonCreateAvailabilityRequest {
    intent: 'lesson_create';
    courseId: string;
    studentId: string;
    instructorId: string;
    vehicleId: string;
    date: string;
    startTime: string;
    endTime: string;
}

export interface LessonSelfBookAvailabilityRequest {
    intent: 'lesson_self_book';
    courseId: string;
    instructorId: string;
    date: string;
    startTime: string;
    endTime: string;
}

export type ScheduleAvailabilityRequest =
    | EventCreateAvailabilityRequest
    | EventEditAvailabilityRequest
    | LessonEditAvailabilityRequest
    | LessonCreateAvailabilityRequest
    | LessonSelfBookAvailabilityRequest;

export interface ScheduleAvailabilityIssue {
    code: ScheduleAvailabilityIssueCode;
    field: string;
}

export interface ScheduleAvailabilityResult {
    available: boolean;
    issues: ScheduleAvailabilityIssue[];
    policy: {
        minDurationMinutes: number;
        maxDurationMinutes: number;
    };
}

export type ScheduleAvailabilityStatus =
    | 'idle'
    | 'checking'
    | 'available'
    | 'unavailable'
    | 'error';

export interface EventCreateAvailabilityOptionsRequest {
    intent: 'event_create';
    instructorId: string;
    eventType: 'DRIVE' | 'THEORY';
    date: string;
    vehicleId?: string;
    courseId?: string;
}

export interface EventEditAvailabilityOptionsRequest {
    intent: 'event_edit';
    eventId: string;
    instructorId: string;
    date: string;
    vehicleId?: string;
}

export interface LessonEditAvailabilityOptionsRequest {
    intent: 'lesson_edit';
    lessonId: string;
    instructorId: string;
    date: string;
    vehicleId?: string;
}

export type ScheduleAvailabilityOptionsRequest =
    | EventCreateAvailabilityOptionsRequest
    | EventEditAvailabilityOptionsRequest
    | LessonEditAvailabilityOptionsRequest;

export interface ScheduleAvailabilityOption {
    startTime: string;
    endTimes: string[];
}

export interface ScheduleAvailabilityOptionsResult {
    stepMinutes: number;
    options: ScheduleAvailabilityOption[];
    availableVehicleIds?: string[];
    policy: {
        minDurationMinutes: number;
        maxDurationMinutes: number;
    };
}

const ISSUE_MESSAGES: Record<ScheduleAvailabilityIssueCode, string> = {
    DURATION_TOO_SHORT: 'Wybrany blok jest krótszy niż minimum szkoły.',
    DURATION_TOO_LONG: 'Wybrany blok przekracza maksymalny czas szkoły.',
    INSTRUCTOR_BUSY: 'Instruktor nie jest dostępny w tym terminie.',
    OUTSIDE_INSTRUCTOR_HOURS: 'Termin wykracza poza godziny pracy instruktora.',
    INSTRUCTOR_NOT_ELIGIBLE:
        'Wybrany instruktor nie może prowadzić tej lekcji.',
    PARTICIPANT_BUSY:
        'Nowy termin koliduje z harmonogramem zapisanego kursanta.',
    STUDENT_BUSY: 'Kursant ma już inne zajęcia w tym terminie.',
    STUDENT_NOT_ELIGIBLE:
        'Wybrany kursant nie może zarezerwować lekcji w ramach tego kursu.',
    COURSE_LIMIT_EXCEEDED:
        'Ta lekcja przekroczyłaby dostępny pakiet godzin kursanta.',
    DATE_NOT_BOOKABLE: 'Wybrana data jest poza dozwolonym zakresem rezerwacji.',
    VEHICLE_UNAVAILABLE: 'Wybrany pojazd jest obecnie niedostępny.',
    VEHICLE_BUSY: 'Wybrany pojazd jest zajęty w tym terminie.',
    NO_VEHICLE_AVAILABLE:
        'W tym terminie nie ma dostępnego pojazdu dla instruktora.',
    COURSE_NOT_ELIGIBLE: 'Instruktor nie może prowadzić wybranego kursu.',
};

export function scheduleAvailabilityIssueMessage(
    issue: ScheduleAvailabilityIssue,
): string {
    return ISSUE_MESSAGES[issue.code] ?? 'Wybrany termin jest niedostępny.';
}
