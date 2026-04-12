/** Body POST /events/:eventId/students (BFF → BE). */
export interface AssignStudentsToEventBody {
    studentIds: string[];
}

/** Odpowiedź POST /events/:eventId/students. */
export interface AssignStudentsToEventResponse {
    assigned: number;
    skipped: number;
}

/** Odpowiedź DELETE /events/:eventId/students. */
export interface RemoveStudentsFromEventResponse {
    removed: number;
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
