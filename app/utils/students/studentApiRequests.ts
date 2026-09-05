import type {
    CourseParticipantDto,
    StudentListPage,
    StudentProcessStatus,
} from '~/types/students/student';
import {
    normalizeStudentListPage,
    normalizeStudentProcessStatus,
} from '~/types/students/student';

export interface StudentsListQuery {
    schoolId: string;
    page: number;
    limit: number;
    courseId?: string;
}

export interface AssignStudentToCourseParams {
    userId: string;
    courseId: string;
}

export interface StudentProcessStatusParams {
    userId: string;
    schoolId: string;
}

export interface UpdateStudentNotesParams {
    userId: string;
    notes: string | null;
}

export interface StudentNotesPatchData {
    notes?: unknown;
}

export function normalizeCourseParticipant(
    data: unknown,
): CourseParticipantDto | null {
    if (data === null || typeof data !== 'object') {
        return null;
    }

    const wrap = data as Record<string, unknown>;
    const raw = wrap.participant;

    if (raw === null || typeof raw !== 'object') {
        return null;
    }

    const p = raw as Record<string, unknown>;
    const id = typeof p.id === 'string' ? p.id.trim() : '';
    const courseId = typeof p.courseId === 'string' ? p.courseId.trim() : '';
    const studentId = typeof p.studentId === 'string' ? p.studentId.trim() : '';
    const createdAt = typeof p.createdAt === 'string' ? p.createdAt.trim() : '';

    if (!id || !courseId || !studentId || !createdAt) {
        return null;
    }

    return { id, courseId, studentId, createdAt };
}

export function buildStudentsListPath(params: StudentsListQuery): string {
    const qs = new URLSearchParams({
        schoolId: params.schoolId.trim(),
        page: String(params.page),
        limit: String(params.limit),
    });

    const courseId = params.courseId?.trim();

    if (courseId) {
        qs.set('courseId', courseId);
    }

    return `/api/students?${qs.toString()}`;
}

export function buildStudentPath(userId: string): string {
    return `/api/students/${encodeURIComponent(userId.trim())}`;
}

export function buildStudentCoursePath(userId: string): string {
    return `${buildStudentPath(userId)}/courses`;
}

export function buildStudentProcessStatusPath(
    params: StudentProcessStatusParams,
): string {
    const qs = new URLSearchParams({ schoolId: params.schoolId.trim() });

    return `${buildStudentPath(params.userId)}/process-status?${qs.toString()}`;
}

export function readNotesFromPatchData(
    data: unknown,
): string | null | undefined {
    if (data === null || typeof data !== 'object') {
        return undefined;
    }

    const record = data as Record<string, unknown>;

    if (!('notes' in record)) {
        return undefined;
    }

    const notes = record.notes;

    if (notes === null || notes === undefined) {
        return null;
    }

    const normalized = String(notes).trim();

    return normalized.length > 0 ? normalized : null;
}

export {
    normalizeStudentListPage,
    normalizeStudentProcessStatus,
    type CourseParticipantDto,
    type StudentListPage,
    type StudentProcessStatus,
};
