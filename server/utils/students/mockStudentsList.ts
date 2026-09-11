import {
    mockCoursesGetById,
    mockCoursesListPayload,
} from '~~/server/utils/courses/mockCoursesList';
import type { StudentAdvancedFilter } from '~~/shared/utils/studentAdvancedFilters';

/** Wiersz listy kursantów — kształt elementu `data.data[]`  wg students-api.md. */
export interface MockStudentListRow {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    pkkNumber: string | null;
    isActive: boolean;
    createdAt: string;
}

const MOCK_STUDENT_NOTES_MAX_LEN = 5000;

type GlobalWithStore = typeof globalThis & {
    __mockStudentsListBySchool?: Record<string, MockStudentListRow[]>;
    __mockCourseParticipants?: Set<string>;
    __mockStudentNotes?: Record<string, string | null>;
};

function getStore(): Record<string, MockStudentListRow[]> {
    const g = globalThis as GlobalWithStore;

    if (!g.__mockStudentsListBySchool) {
        g.__mockStudentsListBySchool = {};
    }

    return g.__mockStudentsListBySchool;
}

function getMockStudentNotesStore(): Record<string, string | null> {
    const g = globalThis as GlobalWithStore;

    if (!g.__mockStudentNotes) {
        g.__mockStudentNotes = {};
    }

    return g.__mockStudentNotes;
}

function findMockStudentRowByUserId(userId: string): MockStudentListRow | null {
    return findMockStudentRowWithSchoolByUserId(userId)?.row ?? null;
}

function findMockStudentRowWithSchoolByUserId(
    userId: string,
): { schoolId: string; row: MockStudentListRow } | null {
    const uid = userId.trim();

    if (!uid) {
        return null;
    }

    const store = getStore();

    for (const [schoolId, rows] of Object.entries(store)) {
        const row = rows.find((r) => r.userId === uid);

        if (row) {
            return { schoolId, row };
        }
    }

    return null;
}

/**
 * Demo: zapis notatki kursanta (PATCH /students/:userId w trybie bez upstreamu).
 */
export function mockUpdateStudentNotes(
    userId: string,
    notes: string | null,
):
    | { ok: true; userId: string; notes: string | null }
    | { ok: false; code: 'NOT_FOUND' | 'NOTES_TOO_LONG' } {
    const uid = userId.trim();

    if (!uid) {
        return { ok: false, code: 'NOT_FOUND' };
    }

    const row = findMockStudentRowByUserId(uid);

    if (!row) {
        return { ok: false, code: 'NOT_FOUND' };
    }

    let normalized: string | null;

    if (notes === null || notes === undefined) {
        normalized = null;
    } else {
        const s = String(notes).trim();

        normalized = s.length > 0 ? s : null;
    }

    if (normalized !== null && normalized.length > MOCK_STUDENT_NOTES_MAX_LEN) {
        return { ok: false, code: 'NOTES_TOO_LONG' };
    }

    const notesStore = getMockStudentNotesStore();

    if (normalized === null) {
        Reflect.deleteProperty(notesStore, uid);
    } else {
        notesStore[uid] = normalized;
    }

    return {
        ok: true,
        userId: uid,
        notes: normalized,
    };
}

const FIRST_NAMES = [
    'Anna',
    'Piotr',
    'Maria',
    'Tomasz',
    'Katarzyna',
    'Michał',
    'Magdalena',
    'Krzysztof',
    'Joanna',
    'Marcin',
    'Aleksandra',
    'Łukasz',
    'Natalia',
    'Paweł',
    'Ewa',
    'Jakub',
    'Paulina',
    'Adam',
    'Izabela',
    'Bartosz',
    'Monika',
    'Wojciech',
    'Karolina',
    'Dariusz',
    'Zofia',
] as const;

const LAST_NAMES = [
    'Kowalski',
    'Nowak',
    'Wiśniewski',
    'Wójcik',
    'Kowalczyk',
    'Kamiński',
    'Lewandowski',
    'Zieliński',
    'Szymański',
    'Woźniak',
    'Dąbrowski',
    'Kozłowski',
    'Jankowski',
    'Mazur',
    'Wojciechowski',
    'Kwiatkowski',
    'Krawczyk',
    'Piotrowski',
    'Grabowski',
    'Zając',
    'Pawłowski',
    'Michalski',
    'Król',
    'Wieczorek',
    'Jabłoński',
] as const;

function compareStudents(a: MockStudentListRow, b: MockStudentListRow): number {
    const ln = a.lastName.localeCompare(b.lastName, 'pl', {
        sensitivity: 'base',
    });

    if (ln !== 0) {
        return ln;
    }

    return a.firstName.localeCompare(b.firstName, 'pl', {
        sensitivity: 'base',
    });
}

function mockStudentAssignedToCourse(
    studentId: string,
    courseId: string,
): boolean {
    const combined = `${studentId}:${courseId}`;
    let h = 0;

    for (let i = 0; i < combined.length; i++) {
        h = (h * 31 + combined.charCodeAt(i)) | 0;
    }

    return Math.abs(h) % 2 === 0;
}

function hashForMock(value: string): number {
    let h = 0;

    for (let i = 0; i < value.length; i++) {
        h = (h * 31 + value.charCodeAt(i)) | 0;
    }

    return Math.abs(h);
}

function mockStudentHasOverduePayments(row: MockStudentListRow): boolean {
    return hashForMock(`${row.id}:overdue`) % 4 === 0;
}

function mockStudentHasUpcomingLesson(
    row: MockStudentListRow,
    schoolId: string,
): boolean {
    const courses = mockCoursesListPayload(schoolId).courses;
    const hasCourse = courses.some((course) =>
        mockStudentVisibleInCourseFilter(row.id, course.id),
    );

    return hasCourse && hashForMock(`${row.id}:lesson`) % 3 !== 0;
}

function getMockCourseParticipantSet(): Set<string> {
    const g = globalThis as GlobalWithStore;

    if (!g.__mockCourseParticipants) {
        g.__mockCourseParticipants = new Set();
    }

    return g.__mockCourseParticipants;
}

function mockCourseParticipantKey(
    studentProfileId: string,
    courseId: string,
): string {
    return `${studentProfileId.trim()}:${courseId.trim()}`;
}

/** Uczestnictwo zapisane przez POST w trybie demo lub „losowe” demo (hash). */
export function mockStudentVisibleInCourseFilter(
    studentProfileId: string,
    courseId: string,
): boolean {
    const key = mockCourseParticipantKey(studentProfileId, courseId);

    if (getMockCourseParticipantSet().has(key)) {
        return true;
    }

    return mockStudentAssignedToCourse(studentProfileId, courseId);
}

export type MockAssignStudentCourseErrorCode =
    | 'COURSE_NOT_FOUND'
    | 'STUDENT_NOT_IN_SCHOOL'
    | 'DUPLICATE';

/**
 * Demo: przypisanie kursanta (userId) do kursu — spójne z filtrem listy.
 */
export function mockCourseParticipantAssign(params: {
    studentUserId: string;
    courseId: string;
}):
    | { ok: true; participant: MockCourseParticipantRecord }
    | { ok: false; code: MockAssignStudentCourseErrorCode } {
    const courseId = params.courseId.trim();
    const studentUserId = params.studentUserId.trim();

    const course = mockCoursesGetById(courseId);

    if (!course) {
        return { ok: false, code: 'COURSE_NOT_FOUND' };
    }

    const schoolId = course.schoolId;
    const all = ensureSeedForSchool(schoolId);
    const row = all.find((r) => r.userId === studentUserId);

    if (!row) {
        return { ok: false, code: 'STUDENT_NOT_IN_SCHOOL' };
    }

    const set = getMockCourseParticipantSet();
    const key = mockCourseParticipantKey(row.id, courseId);

    if (set.has(key)) {
        return { ok: false, code: 'DUPLICATE' };
    }

    set.add(key);

    const participant: MockCourseParticipantRecord = {
        id: crypto.randomUUID(),
        courseId,
        studentId: row.id,
        createdAt: new Date().toISOString(),
    };

    return { ok: true, participant };
}

export interface MockCourseParticipantRecord {
    id: string;
    courseId: string;
    studentId: string;
    createdAt: string;
}

function ensureSeedForSchool(schoolId: string): MockStudentListRow[] {
    const store = getStore();

    if (store[schoolId]?.length) {
        return store[schoolId]!;
    }

    const short = schoolId.replace(/-/g, '').slice(0, 8);
    const createdBase = new Date('2024-06-01T10:00:00.000Z').getTime();
    const rows: MockStudentListRow[] = [];

    for (let i = 0; i < 25; i++) {
        const profileId = crypto.randomUUID();
        const userId = crypto.randomUUID();
        const fn = FIRST_NAMES[i % FIRST_NAMES.length]!;
        const ln = LAST_NAMES[i % LAST_NAMES.length]!;
        const email = `${fn.toLowerCase()}.${ln.toLowerCase()}.${short}.${i}@example.com`;

        rows.push({
            id: profileId,
            userId,
            firstName: fn,
            lastName: ln,
            email,
            phone:
                i % 4 === 0
                    ? `+48 600 ${String(100 + i).padStart(3, '0')} ${String(200 + i).slice(0, 3)}`
                    : null,
            avatarUrl: null,
            pkkNumber: i % 5 === 0 ? `PKK-${short}-${i}` : null,
            isActive: true,
            createdAt: new Date(createdBase + i * 3600000).toISOString(),
        });
    }

    rows.sort(compareStudents);
    store[schoolId] = rows;

    return rows;
}

/** Kształt `data` w kopercie sukcesu GET /students/:userId (wg students-api.md). */
export interface MockStudentDetailPayload {
    id: string;
    userId: string;
    schoolId: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
    pkkNumber: string | null;
    notes: string | null;
    courses: Array<{
        id: string;
        name: string;
        category: string;
        status: string;
    }>;
}

export interface MockStudentProcessStatusPayload {
    steps: Array<{
        name: string;
        completed: boolean;
        description: string;
    }>;
}

const MOCK_PARTICIPANT_STATUSES = ['ACTIVE', 'COMPLETED', 'SUSPENDED'] as const;

function hashUserIdForMockCourses(userId: string): number {
    const s = userId.trim();
    let h = 0;

    for (let i = 0; i < s.length; i++) {
        h = (h * 31 + s.charCodeAt(i)) | 0;
    }

    return Math.abs(h);
}

/**
 * Szczegóły kursanta w trybie demo — 1–3 kursy z mocka OSK, status deterministyczny.
 */
export function mockStudentDetailPayload(
    userId: string,
    schoolId?: string,
): MockStudentDetailPayload | null {
    const uid = userId.trim();
    const sid = schoolId?.trim() ?? '';

    if (!uid) {
        return null;
    }

    const found = sid
        ? {
              schoolId: sid,
              row: ensureSeedForSchool(sid).find((r) => r.userId === uid),
          }
        : findMockStudentRowWithSchoolByUserId(uid);

    if (!found?.row) {
        return null;
    }

    const row = found.row;
    const resolvedSchoolId = found.schoolId;

    const notesRaw = getMockStudentNotesStore()[uid];
    const notes =
        notesRaw !== undefined &&
        notesRaw !== null &&
        String(notesRaw).trim().length > 0
            ? String(notesRaw)
            : null;

    const { courses: schoolCourses } = mockCoursesListPayload(resolvedSchoolId);
    const sorted = [...schoolCourses].sort((a, b) =>
        a.id.localeCompare(b.id, 'en'),
    );

    const h = hashUserIdForMockCourses(uid);
    const n = sorted.length;

    if (n === 0) {
        return {
            id: row.id,
            userId: row.userId,
            schoolId: resolvedSchoolId,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            avatarUrl: row.avatarUrl,
            pkkNumber: row.pkkNumber,
            notes,
            courses: [],
        };
    }

    const maxPick = Math.min(3, n);
    const pickCount = 1 + (h % maxPick);
    const start = h % n;

    const picked: typeof sorted = [];
    const seen = new Set<string>();

    for (let i = 0; i < pickCount && picked.length < n; i++) {
        const course = sorted[(start + i) % n]!;

        if (seen.has(course.id)) {
            continue;
        }

        seen.add(course.id);
        picked.push(course);
    }

    const courses = picked.map((c, i) => ({
        id: c.id,
        name: c.name,
        category: c.category,
        status: MOCK_PARTICIPANT_STATUSES[
            (h + i) % MOCK_PARTICIPANT_STATUSES.length
        ]!,
    }));

    return {
        id: row.id,
        userId: row.userId,
        schoolId: resolvedSchoolId,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        avatarUrl: row.avatarUrl,
        pkkNumber: row.pkkNumber,
        notes,
        courses,
    };
}

/** Kształt `data` w kopercie sukcesu GET /students (wg students-api.md). */
export function mockStudentsListPayload(
    schoolId: string,
    page: number,
    limit: number,
    courseId?: string,
    search = '',
    view = 'all',
    filters: readonly StudentAdvancedFilter[] = [],
): {
    data: MockStudentListRow[];
    total: number;
    page: number;
    limit: number;
} {
    const all = [...ensureSeedForSchool(schoolId)];

    const filtered =
        courseId !== undefined && courseId.trim().length > 0
            ? all.filter((row) =>
                  mockStudentVisibleInCourseFilter(row.id, courseId.trim()),
              )
            : all;

    const terms = search
        .trim()
        .toLocaleLowerCase('pl')
        .split(/\s+/)
        .filter(Boolean);
    const matching = filtered.filter((row) => {
        const text = [
            row.firstName,
            row.lastName,
            row.email,
            row.phone,
            row.pkkNumber,
        ]
            .join(' ')
            .toLocaleLowerCase('pl');

        if (!terms.every((term) => text.includes(term))) return false;

        if (view === 'without-pkk' && row.pkkNumber?.trim()) return false;

        if (view === 'without-course') {
            if (
                mockCoursesListPayload(schoolId).courses.some((course) =>
                    mockStudentVisibleInCourseFilter(row.id, course.id),
                )
            ) {
                return false;
            }
        }

        if (view === 'overdue' && !mockStudentHasOverduePayments(row))
            return false;

        if (view === 'without-lesson') {
            if (mockStudentHasUpcomingLesson(row, schoolId)) {
                return false;
            }
        }

        return filters.every((filter) =>
            mockStudentMatchesAdvancedFilter(row, schoolId, filter),
        );
    });
    const total = matching.length;
    const safeLimit = Math.max(1, Math.min(100, limit));
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;
    const pageRows = matching.slice(offset, offset + safeLimit);

    return {
        data: pageRows,
        total,
        page: safePage,
        limit: safeLimit,
    };
}

function normalizeMockText(value: string | null): string {
    return (value ?? '').trim().toLocaleLowerCase('pl');
}

function mockTextMatches(
    value: string | null,
    operator: string,
    expected: string,
): boolean {
    const actual = normalizeMockText(value);
    const needle = expected.trim().toLocaleLowerCase('pl');

    if (operator === 'contains') return actual.includes(needle);

    if (operator === 'not_contains')
        return value === null || !actual.includes(needle);

    if (operator === 'eq') return actual === needle;

    if (operator === 'neq') return value === null || actual !== needle;

    return false;
}

function mockStudentMatchesAdvancedFilter(
    row: MockStudentListRow,
    schoolId: string,
    filter: StudentAdvancedFilter,
): boolean {
    if (filter.field === 'firstName')
        return mockTextMatches(row.firstName, filter.operator, filter.value);

    if (filter.field === 'lastName')
        return mockTextMatches(row.lastName, filter.operator, filter.value);

    if (filter.field === 'email')
        return mockTextMatches(row.email, filter.operator, filter.value);

    if (filter.field === 'phone') {
        if (filter.operator === 'is_empty') return !row.phone?.trim();

        if (filter.operator === 'is_not_empty')
            return Boolean(row.phone?.trim());

        if (!('value' in filter)) return false;

        return mockTextMatches(row.phone, filter.operator, filter.value);
    }

    if (filter.field === 'pkkNumber') {
        if (filter.operator === 'is_empty') return !row.pkkNumber?.trim();

        if (filter.operator === 'is_not_empty')
            return Boolean(row.pkkNumber?.trim());

        if (!('value' in filter)) return false;

        return mockTextMatches(row.pkkNumber, filter.operator, filter.value);
    }

    if (filter.field === 'isActive') {
        return filter.operator === 'eq'
            ? row.isActive === filter.value
            : row.isActive !== filter.value;
    }

    if (filter.field === 'courseId') {
        if (
            filter.operator === 'is_empty' ||
            filter.operator === 'is_not_empty'
        ) {
            const hasAnyCourse = mockCoursesListPayload(schoolId).courses.some(
                (course) => mockStudentVisibleInCourseFilter(row.id, course.id),
            );

            return filter.operator === 'is_not_empty'
                ? hasAnyCourse
                : !hasAnyCourse;
        }

        if (!('value' in filter)) return false;

        const hasCourse = mockStudentVisibleInCourseFilter(
            row.id,
            filter.value,
        );

        return filter.operator === 'eq' ? hasCourse : !hasCourse;
    }

    if (filter.field === 'hasOverduePayments') {
        return mockStudentHasOverduePayments(row) === filter.value;
    }

    if (filter.field === 'hasUpcomingLesson') {
        return mockStudentHasUpcomingLesson(row, schoolId) === filter.value;
    }

    if (filter.field === 'createdAt') {
        const createdAt = row.createdAt.slice(0, 10);

        if (filter.operator === 'before') return createdAt < filter.value;

        if (filter.operator === 'after') return createdAt > filter.value;

        return createdAt >= filter.value[0] && createdAt <= filter.value[1];
    }

    return true;
}

export function mockStudentProcessStatusPayload(
    userId: string,
    schoolId: string,
): MockStudentProcessStatusPayload | null {
    const detail = mockStudentDetailPayload(userId, schoolId);

    if (!detail) {
        return null;
    }

    const hasPkk =
        detail.pkkNumber !== null && detail.pkkNumber.trim().length > 0;
    const hasCourses = detail.courses.length > 0;

    return {
        steps: [
            {
                name: 'Dane kursanta',
                completed:
                    detail.firstName.trim().length > 0 &&
                    detail.lastName.trim().length > 0 &&
                    detail.email.trim().length > 0,
                description:
                    'Uzupełnij podstawowe dane kursanta i upewnij się, że konto jest aktywne.',
            },
            {
                name: 'Numer PKK',
                completed: hasPkk,
                description: 'Dodaj numer PKK kursanta.',
            },
            {
                name: 'Przypisanie do kursu',
                completed: hasCourses,
                description: 'Przypisz kursanta do kursu w tej OSK.',
            },
            {
                name: 'Zaplanowanie jazd',
                completed: hasCourses && hasPkk,
                description: 'Zaplanuj co najmniej jedną nieanulowaną jazdę.',
            },
        ],
    };
}
