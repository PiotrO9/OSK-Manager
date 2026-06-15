import type { BadgeVariants } from '~/components/shadcn/badge';

/** Rekord uczestnictwa (POST /students/:userId/courses) — pole `data.participant`. */
export interface CourseParticipantDto {
    id: string;
    courseId: string;
    studentId: string;
    createdAt: string;
}

/** Element listy kursantów (GET /students) — zgodnie z students-api.md (BE). */
export interface StudentListItem {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    pkkNumber: string | null;
    isActive: boolean;
    createdAt: string;
}

/** Paginowana strona listy kursantów (po normalizacji). */
export interface StudentListPage {
    items: StudentListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/** Kurs w szczegółach kursanta (GET /students/:userId) — status z course_participants. */
export interface StudentCourseItem {
    id: string;
    name: string;
    category: string;
    status: string;
}

/** Szczegóły kursanta z listą kursów w OSK. */
export interface StudentDetail {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    pkkNumber: string | null;
    /** Notatka globalna dla kursanta (student_profiles.notes). */
    notes: string | null;
    courses: StudentCourseItem[];
}

/** Znane statusy uczestnictwa — etykiety UI; nieznany kod → „Nieznany”. */
export const STUDENT_COURSE_STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'Aktywny',
    FINISHED: 'Zakończony',
    UNKNOWN: 'Nieznany',
};

export function formatStudentCourseStatusLabel(status: string): string {
    const key = status.trim().toUpperCase();

    if (!key) {
        return 'Nieznany';
    }

    return STUDENT_COURSE_STATUS_LABELS[key] ?? 'Nieznany';
}

type BadgeVariant = NonNullable<BadgeVariants['variant']>;

export function getStudentCourseStatusVariant(status: string): BadgeVariant {
    const key = status.trim().toUpperCase();

    if (key === 'ACTIVE') return 'default';

    if (key === 'FINISHED') return 'secondary';

    return 'outline';
}

export function formatStudentDisplayName(student: StudentListItem): string {
    const parts = [student.firstName, student.lastName]
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    if (parts.length === 0) {
        return '—';
    }

    return parts.join(' ');
}

function parseBooleanLike(raw: unknown, defaultValue: boolean): boolean {
    if (typeof raw === 'boolean') {
        return raw;
    }

    return defaultValue;
}

function readStringOrNull(raw: unknown): string | null {
    if (raw === null || raw === undefined) {
        return null;
    }

    const s = String(raw).trim();

    return s.length > 0 ? s : null;
}

export function normalizeStudentListItem(raw: unknown): StudentListItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;

    const id = o.id != null ? String(o.id).trim() : '';

    if (!id) {
        return null;
    }

    const userIdRaw = o.userId ?? o.user_id;
    const userId =
        userIdRaw != null && String(userIdRaw).trim().length > 0
            ? String(userIdRaw).trim()
            : id;

    const firstName =
        o.firstName != null
            ? String(o.firstName).trim()
            : o.first_name != null
              ? String(o.first_name).trim()
              : '';

    const lastName =
        o.lastName != null
            ? String(o.lastName).trim()
            : o.last_name != null
              ? String(o.last_name).trim()
              : '';

    const email = o.email != null ? String(o.email).trim().toLowerCase() : '';

    if (!firstName || !lastName || !email) {
        return null;
    }

    const phone = readStringOrNull(o.phone ?? o.phone_number);
    const pkkNumber = readStringOrNull(o.pkkNumber ?? o.pkk_number);

    const createdAtRaw = o.createdAt ?? o.created_at;
    const createdAt = createdAtRaw != null ? String(createdAtRaw).trim() : '';

    if (!createdAt) {
        return null;
    }

    return {
        id,
        userId,
        firstName,
        lastName,
        email,
        phone,
        pkkNumber,
        isActive: parseBooleanLike(o.isActive ?? o.is_active, true),
        createdAt,
    };
}

function readItemsArray(record: Record<string, unknown>): unknown[] | null {
    const nested = record.data;

    if (Array.isArray(nested)) {
        return nested;
    }

    if (Array.isArray(record.items)) {
        return record.items;
    }

    if (Array.isArray(record.students)) {
        return record.students;
    }

    return null;
}

function clampInt(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) {
        return min;
    }

    const n = Math.trunc(value);

    if (n < min) {
        return min;
    }

    if (n > max) {
        return max;
    }

    return n;
}

/**
 * Normalizuje `data` z koperty po `unwrapApiSuccessData` — obiekt z polami
 * `data` (tablica), `total`, `page`, `limit` wg students-api.md.
 */
export function normalizeStudentListPage(
    data: unknown,
): StudentListPage | null {
    if (!data || typeof data !== 'object') {
        return null;
    }

    const record = data as Record<string, unknown>;
    const itemsRaw = readItemsArray(record);

    if (itemsRaw === null) {
        return null;
    }

    const items = itemsRaw
        .map((row) => normalizeStudentListItem(row))
        .filter((x): x is StudentListItem => x !== null);

    const totalRaw = record.total;
    let total: number;

    if (typeof totalRaw === 'number' && Number.isFinite(totalRaw)) {
        total = Math.max(0, Math.trunc(totalRaw));
    } else if (typeof totalRaw === 'string') {
        const p = Number.parseInt(totalRaw.trim(), 10);

        total = Number.isNaN(p) ? items.length : Math.max(0, p);
    } else {
        total = NaN;
    }

    if (!Number.isFinite(total)) {
        return null;
    }

    const pageRaw = record.page;
    let page = 1;

    if (typeof pageRaw === 'number' && Number.isFinite(pageRaw)) {
        page = clampInt(pageRaw, 1, 1_000_000);
    } else if (typeof pageRaw === 'string') {
        const p = Number.parseInt(pageRaw.trim(), 10);

        page = Number.isNaN(p) ? 1 : clampInt(p, 1, 1_000_000);
    }

    const limitRaw = record.limit;
    let limit = 20;

    if (typeof limitRaw === 'number' && Number.isFinite(limitRaw)) {
        limit = clampInt(limitRaw, 1, 100);
    } else if (typeof limitRaw === 'string') {
        const p = Number.parseInt(limitRaw.trim(), 10);

        limit = Number.isNaN(p) ? 20 : clampInt(p, 1, 100);
    }

    const totalPages = total === 0 ? 1 : Math.max(1, Math.ceil(total / limit));

    return {
        items,
        total,
        page,
        limit,
        totalPages,
    };
}

function normalizeStudentCourseItem(raw: unknown): StudentCourseItem | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;

    const id = o.id != null ? String(o.id).trim() : '';

    if (!id) {
        return null;
    }

    const name =
        o.name != null
            ? String(o.name).trim()
            : o.title != null
              ? String(o.title).trim()
              : '';

    if (!name) {
        return null;
    }

    const category =
        o.category != null
            ? String(o.category).trim()
            : o.category_code != null
              ? String(o.category_code).trim()
              : '';

    const statusRaw = o.status;

    const status =
        statusRaw != null && String(statusRaw).trim().length > 0
            ? String(statusRaw).trim().toUpperCase()
            : 'UNKNOWN';

    return {
        id,
        name,
        category,
        status,
    };
}

/**
 * Normalizuje `data` z koperty po `unwrapApiSuccessData` — szczegóły kursanta
 * wg students-api.md (GET /students/:userId).
 */
export function normalizeStudentDetail(raw: unknown): StudentDetail | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;

    const id = o.id != null ? String(o.id).trim() : '';

    if (!id) {
        return null;
    }

    const userIdRaw = o.userId ?? o.user_id;
    const userId =
        userIdRaw != null && String(userIdRaw).trim().length > 0
            ? String(userIdRaw).trim()
            : id;

    const firstName =
        o.firstName != null
            ? String(o.firstName).trim()
            : o.first_name != null
              ? String(o.first_name).trim()
              : '';

    const lastName =
        o.lastName != null
            ? String(o.lastName).trim()
            : o.last_name != null
              ? String(o.last_name).trim()
              : '';

    const email = o.email != null ? String(o.email).trim().toLowerCase() : '';

    if (!firstName || !lastName || !email) {
        return null;
    }

    const pkkNumber = readStringOrNull(o.pkkNumber ?? o.pkk_number);
    const notes = readStringOrNull(o.notes);

    const coursesRaw = o.courses;

    const courses: StudentCourseItem[] = Array.isArray(coursesRaw)
        ? coursesRaw
              .map((row) => normalizeStudentCourseItem(row))
              .filter((x): x is StudentCourseItem => x !== null)
        : [];

    return {
        id,
        userId,
        firstName,
        lastName,
        email,
        pkkNumber,
        notes,
        courses,
    };
}

export interface StudentProcessStatusStep {
    name: string;
    completed: boolean;
    description: string;
}

export interface StudentProcessStatus {
    steps: StudentProcessStatusStep[];
}

function normalizeStudentProcessStatusStep(
    raw: unknown,
): StudentProcessStatusStep | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;
    const name = o.name != null ? String(o.name).trim() : '';

    if (!name) {
        return null;
    }

    const description =
        o.description != null ? String(o.description).trim() : '';

    return {
        name,
        completed: parseBooleanLike(o.completed, false),
        description,
    };
}

export function normalizeStudentProcessStatus(
    raw: unknown,
): StudentProcessStatus | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const o = raw as Record<string, unknown>;

    if (!Array.isArray(o.steps)) {
        return null;
    }

    return {
        steps: o.steps
            .map((row) => normalizeStudentProcessStatusStep(row))
            .filter((x): x is StudentProcessStatusStep => x !== null),
    };
}
