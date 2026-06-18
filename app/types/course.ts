import {
    normalizeCourseTypeOption,
    type CourseTypeOption,
} from '~/types/courseType';

export type CourseKind = 'THEORY_GROUP' | 'PRACTICAL' | 'EXTRA';
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
    /** Gdy backend / mock zwraca (np. do `GET /instructors?schoolId`). */
    schoolId?: string;
}

/** Body PATCH `/courses/:id` — tylko zmiana instruktora (MVP). */
export interface CoursePatchInstructorPayload {
    instructorId: string | null;
}

const COURSE_KIND_LABELS: Record<CourseKind, string> = {
    THEORY_GROUP: 'Teoria (grupa)',
    PRACTICAL: 'Praktyka',
    EXTRA: 'Kurs dodatkowy',
};

export function formatCourseKindLabel(kind: CourseKind): string {
    return COURSE_KIND_LABELS[kind] ?? kind;
}

const COURSE_PARTICIPANT_STATUS_LABELS: Record<
    CourseParticipantStatus,
    string
> = {
    ACTIVE: 'Aktywny',
    FINISHED: 'Ukończony',
};

export function formatCourseParticipantStatusLabel(
    status: CourseParticipantStatus,
): string {
    return COURSE_PARTICIPANT_STATUS_LABELS[status] ?? status;
}

function isCourseKind(value: string): value is CourseKind {
    return (
        value === 'THEORY_GROUP' || value === 'PRACTICAL' || value === 'EXTRA'
    );
}

function isCourseParticipantStatus(
    value: string,
): value is CourseParticipantStatus {
    return value === 'ACTIVE' || value === 'FINISHED';
}

export function normalizeCourseProgress(raw: unknown): number {
    let progress = 0;

    if (typeof raw === 'number' && Number.isFinite(raw)) {
        progress = raw;
    } else if (typeof raw === 'string') {
        const parsed = Number.parseFloat(raw.trim());

        if (Number.isFinite(parsed)) {
            progress = parsed;
        }
    }

    return Math.max(0, Math.min(100, Math.round(progress)));
}

function normalizeInstructorRef(raw: unknown): CourseInstructorRef | null {
    if (raw === null || raw === undefined) {
        return null;
    }

    if (typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = o.id != null ? String(o.id).trim() : '';
    const name = o.name != null ? String(o.name).trim() : '';

    if (!id || !name) {
        return null;
    }

    return { id, name };
}

function normalizeCourseListItem(raw: unknown): CourseListItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = o.id != null ? String(o.id).trim() : '';

    if (!id) {
        return null;
    }

    const name = o.name != null ? String(o.name).trim() : '';

    if (!name) {
        return null;
    }

    const category = o.category != null ? String(o.category).trim() : '';

    if (!category) {
        return null;
    }

    const typeRaw =
        o.type != null
            ? String(o.type).trim()
            : o.kind != null
              ? String(o.kind).trim()
              : '';

    if (!typeRaw || !isCourseKind(typeRaw)) {
        return null;
    }

    const th = o.totalHours;
    let totalHours: number;

    if (typeof th === 'number' && Number.isFinite(th)) {
        totalHours = Math.trunc(th);
    } else if (typeof th === 'string') {
        const parsed = Number.parseInt(th.trim(), 10);

        if (Number.isNaN(parsed)) {
            return null;
        }

        totalHours = parsed;
    } else {
        return null;
    }

    if (totalHours < 0) {
        return null;
    }

    return {
        id,
        name,
        category,
        courseType: normalizeCourseTypeOption(o.courseType),
        type: typeRaw,
        totalHours,
        instructor: normalizeInstructorRef(o.instructor),
    };
}

function normalizeCurrentUserCourseItem(
    raw: unknown,
): CurrentUserCourseItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const id = o.id != null ? String(o.id).trim() : '';
    const schoolId =
        o.schoolId != null
            ? String(o.schoolId).trim()
            : o.school_id != null
              ? String(o.school_id).trim()
              : '';
    const name = o.name != null ? String(o.name).trim() : '';
    const statusRaw = o.status != null ? String(o.status).trim() : '';
    const typeRaw =
        o.type != null
            ? String(o.type).trim()
            : o.kind != null
              ? String(o.kind).trim()
              : '';

    if (
        !id ||
        !schoolId ||
        !name ||
        !isCourseParticipantStatus(statusRaw) ||
        !isCourseKind(typeRaw)
    ) {
        return null;
    }

    const totalHoursRaw = o.totalHours ?? o.total_hours;
    let totalHours: number;

    if (typeof totalHoursRaw === 'number' && Number.isFinite(totalHoursRaw)) {
        totalHours = Math.trunc(totalHoursRaw);
    } else if (typeof totalHoursRaw === 'string') {
        const parsed = Number.parseInt(totalHoursRaw.trim(), 10);

        if (Number.isNaN(parsed)) {
            return null;
        }

        totalHours = parsed;
    } else {
        return null;
    }

    return {
        id,
        schoolId,
        name,
        status: statusRaw,
        type: typeRaw,
        totalHours,
        progress: normalizeCourseProgress(o.progress),
    };
}

function normalizeCourseCapacity(o: Record<string, unknown>): number | null {
    if (!('capacity' in o)) {
        return null;
    }

    const c = o.capacity;

    if (c === null || c === undefined) {
        return null;
    }

    if (typeof c === 'number' && Number.isFinite(c)) {
        const n = Math.trunc(c);

        if (n < 0) {
            return null;
        }

        return n;
    }

    if (typeof c === 'string') {
        const parsed = Number.parseInt(c.trim(), 10);

        if (Number.isNaN(parsed) || parsed < 0) {
            return null;
        }

        return parsed;
    }

    return null;
}

function readCourseSchoolId(o: Record<string, unknown>): string | undefined {
    for (const key of ['schoolId', 'school_id'] as const) {
        const raw = o[key];

        if (raw == null) {
            continue;
        }

        const s = String(raw).trim();

        if (s.length > 0) {
            return s;
        }
    }

    const school = o.school;

    if (school && typeof school === 'object' && school !== null) {
        const so = school as Record<string, unknown>;

        for (const key of ['id', 'schoolId', 'school_id'] as const) {
            const raw = so[key];

            if (raw == null) {
                continue;
            }

            const s = String(raw).trim();

            if (s.length > 0) {
                return s;
            }
        }
    }

    return undefined;
}

function normalizeCourseDetailInner(raw: unknown): CourseDetail | null {
    const base = normalizeCourseListItem(raw);

    if (!base || typeof raw !== 'object' || raw === null) {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const schoolId = readCourseSchoolId(o);

    return {
        ...base,
        capacity: normalizeCourseCapacity(o),
        ...(schoolId !== undefined ? { schoolId } : {}),
    };
}

/**
 * Normalizuje payload ze `unwrapApiSuccessData`: `{ course }` (BE) lub płaski obiekt kursu.
 */
export function normalizeCourseDetailData(data: unknown): CourseDetail | null {
    if (!data || typeof data !== 'object') {
        return null;
    }

    const record = data as Record<string, unknown>;

    if ('course' in record) {
        const nested = record.course;

        if (nested === null || nested === undefined) {
            return null;
        }

        return normalizeCourseDetailInner(nested);
    }

    return normalizeCourseDetailInner(data);
}

export function normalizeCoursesList(data: unknown): CourseListItem[] {
    if (Array.isArray(data)) {
        return data
            .map((item) => normalizeCourseListItem(item))
            .filter((x): x is CourseListItem => x !== null);
    }

    if (!data || typeof data !== 'object') {
        return [];
    }

    const record = data as Record<string, unknown>;

    for (const key of ['courses', 'items', 'data'] as const) {
        const nested = record[key];

        if (Array.isArray(nested)) {
            return normalizeCoursesList(nested);
        }
    }

    return [];
}

export function normalizeMyCoursesList(data: unknown): CurrentUserCourseItem[] {
    if (Array.isArray(data)) {
        return data
            .map((item) => normalizeCurrentUserCourseItem(item))
            .filter((x): x is CurrentUserCourseItem => x !== null);
    }

    if (!data || typeof data !== 'object') {
        return [];
    }

    const record = data as Record<string, unknown>;

    for (const key of ['courses', 'items', 'data'] as const) {
        const nested = record[key];

        if (Array.isArray(nested)) {
            return normalizeMyCoursesList(nested);
        }
    }

    return [];
}
