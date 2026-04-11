/** Event instruktora — POST /events (BE InstructorEventDto). */

export type InstructorEventTypeCode = 'DRIVE' | 'THEORY';

export interface InstructorEvent {
    id: string;
    instructorId: string;
    type: InstructorEventTypeCode | string;
    startTime: string;
    endTime: string;
    vehicleId: string | null;
    createdAt: string;
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
}
