import type {
    CreateInstructorEventPayload,
    InstructorEvent,
    PatchInstructorEventPayload,
    TheoryEventEligibleStudentsData,
} from '~/types/events/instructorEvent';

export interface InstructorEventCreateRequestBody {
    instructorId: string;
    type: CreateInstructorEventPayload['type'];
    startTime: string;
    endTime: string;
    vehicleId?: string;
    capacity?: number;
    courseId?: string;
}

export type InstructorEventPatchRequestBody = Partial<{
    instructorId: string;
    type: PatchInstructorEventPayload['type'];
    startTime: string;
    endTime: string;
    vehicleId: string | null;
    capacity: number | null;
    status: NonNullable<PatchInstructorEventPayload['status']>;
}>;

export type EventStudentsPayload =
    | string[]
    | Array<Record<string, unknown>>
    | {
          data?: unknown;
          studentUserIds?: unknown;
          studentIds?: unknown;
          assignedStudentIds?: unknown;
          students?: unknown;
          items?: unknown;
          participants?: unknown;
      }
    | null;

export type TheoryEventEligibleStudentsPayload =
    TheoryEventEligibleStudentsData;

export function buildCreateInstructorEventRequestBody(
    payload: CreateInstructorEventPayload,
): InstructorEventCreateRequestBody {
    const body: InstructorEventCreateRequestBody = {
        instructorId: payload.instructorId.trim(),
        type: payload.type,
        startTime: payload.startTime.trim(),
        endTime: payload.endTime.trim(),
    };

    if (payload.type === 'DRIVE' && payload.vehicleId?.trim()) {
        body.vehicleId = payload.vehicleId.trim();
    }

    if (payload.capacity !== undefined && payload.capacity !== null) {
        body.capacity = payload.capacity;
    }

    if (payload.type === 'THEORY' && payload.courseId?.trim()) {
        body.courseId = payload.courseId.trim();
    }

    return body;
}

export function buildPatchInstructorEventRequestBody(
    payload: PatchInstructorEventPayload,
): InstructorEventPatchRequestBody {
    const body: InstructorEventPatchRequestBody = {};

    if (payload.instructorId !== undefined) {
        body.instructorId = payload.instructorId.trim();
    }

    if (payload.type !== undefined) {
        body.type = payload.type;
    }

    if (payload.startTime !== undefined) {
        body.startTime = payload.startTime.trim();
    }

    if (payload.endTime !== undefined) {
        body.endTime = payload.endTime.trim();
    }

    if (payload.vehicleId !== undefined) {
        body.vehicleId = payload.vehicleId;
    }

    if (payload.capacity !== undefined) {
        body.capacity = payload.capacity;
    }

    if (payload.status !== undefined) {
        body.status = payload.status;
    }

    return body;
}

export function isTheoryInstructorEvent(ev: InstructorEvent): boolean {
    const t = String(ev.type ?? '')
        .trim()
        .toUpperCase();

    return t === 'THEORY';
}

export function buildTheoryEventEligibleStudentsQuery(opts?: {
    startTime?: string;
    endTime?: string;
}): string {
    const start = opts?.startTime?.trim();
    const end = opts?.endTime?.trim();

    return start && end
        ? `?startTime=${encodeURIComponent(start)}&endTime=${encodeURIComponent(end)}`
        : '';
}
