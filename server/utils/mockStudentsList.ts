import {
    mockCoursesGetById,
    mockCoursesListPayload,
} from '~~/server/utils/mockCoursesList';

/** Wiersz listy kursantów — kształt elementu `data.data[]`  wg students-api.md. */
export interface MockStudentListRow {
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

type GlobalWithStore = typeof globalThis & {
    __mockStudentsListBySchool?: Record<string, MockStudentListRow[]>;
    __mockCourseParticipants?: Set<string>;
};

function getStore(): Record<string, MockStudentListRow[]> {
    const g = globalThis as GlobalWithStore;

    if (!g.__mockStudentsListBySchool) {
        g.__mockStudentsListBySchool = {};
    }

    return g.__mockStudentsListBySchool;
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
    firstName: string;
    lastName: string;
    email: string;
    pkkNumber: string | null;
    courses: Array<{
        id: string;
        name: string;
        category: string;
        status: string;
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
    schoolId: string,
): MockStudentDetailPayload | null {
    const uid = userId.trim();
    const sid = schoolId.trim();

    if (!uid || !sid) {
        return null;
    }

    const all = ensureSeedForSchool(sid);
    const row = all.find((r) => r.userId === uid);

    if (!row) {
        return null;
    }

    const { courses: schoolCourses } = mockCoursesListPayload(sid);
    const sorted = [...schoolCourses].sort((a, b) =>
        a.id.localeCompare(b.id, 'en'),
    );

    const h = hashUserIdForMockCourses(uid);
    const n = sorted.length;

    if (n === 0) {
        return {
            id: row.id,
            userId: row.userId,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            pkkNumber: row.pkkNumber,
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
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        pkkNumber: row.pkkNumber,
        courses,
    };
}

/** Kształt `data` w kopercie sukcesu GET /students (wg students-api.md). */
export function mockStudentsListPayload(
    schoolId: string,
    page: number,
    limit: number,
    courseId?: string,
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

    const total = filtered.length;
    const safeLimit = Math.max(1, Math.min(100, limit));
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;
    const pageRows = filtered.slice(offset, offset + safeLimit);

    return {
        data: pageRows,
        total,
        page: safePage,
        limit: safeLimit,
    };
}
