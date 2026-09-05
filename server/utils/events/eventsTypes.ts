export interface InstructorEventResponse {
    id: string;
    instructorId: string;
    type: string;
    startTime: string;
    endTime: string;
    vehicleId: string | null;
    capacity?: number | null;
    courseId?: string | null;
    status?: string;
    createdAt: string;
}

export interface EventStudentsReplaceResponse {
    studentUserIds: string[];
}

export interface EventStudentsAssignResponse {
    assigned: number;
    skipped: number;
}
