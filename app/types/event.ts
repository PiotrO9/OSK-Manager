/** Body POST /events/:eventId/students (BFF → BE). */
export interface AssignStudentsToEventBody {
    studentIds: string[];
}

/** Odpowiedź POST /events/:eventId/students. */
export interface AssignStudentsToEventResponse {
    assigned: number;
    skipped: number;
}

/** Odpowiedź PUT /events/:eventId/students (pełna zamiana listy). */
export interface ReplaceStudentsOnEventResponse {
    studentUserIds: string[];
}

/** Odpowiedź DELETE /events/:eventId/students/:studentUserId. */
export interface RemoveStudentsFromEventResponse {
    studentUserIds: string[];
}

/** Event instruktora (np. po POST /events). */
export interface InstructorEventData {
    id: string;
    instructorId: string;
    type: 'DRIVE' | 'THEORY';
    startTime: string;
    endTime: string;
    vehicleId: string | null;
    capacity: number | null;
    createdAt: string;
}
