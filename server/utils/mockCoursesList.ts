import {
    mockInstructorBelongsToSchool,
    mockInstructorsListPayload,
} from '~~/server/utils/mockInstructorsList';

/** Kształt pojedynczego kursu w `data.courses` wg courses-api.md (BE). */
export interface MockCourseListRow {
    id: string;
    name: string;
    category: string;
    type: 'THEORY_GROUP' | 'PRACTICAL' | 'EXTRA';
    totalHours: number;
    instructor: { id: string; name: string } | null;
    /** Tylko typ THEORY_GROUP; brak pola = domyślne 24 w szczegółach (seedy demo). */
    capacity?: number | null;
}

type GlobalWithStore = typeof globalThis & {
    __mockCoursesListBySchool?: Record<string, MockCourseListRow[]>;
};

function getStore(): Record<string, MockCourseListRow[]> {
    const g = globalThis as GlobalWithStore;

    if (!g.__mockCoursesListBySchool) {
        g.__mockCoursesListBySchool = {};
    }

    return g.__mockCoursesListBySchool;
}

function ensureSeedForSchool(schoolId: string): MockCourseListRow[] {
    const store = getStore();

    if (store[schoolId]?.length) {
        return store[schoolId]!;
    }

    const short = schoolId.replace(/-/g, '').slice(0, 8);

    store[schoolId] = [
        {
            id: crypto.randomUUID(),
            name: `Kurs teorii — demo (${short})`,
            category: 'B',
            type: 'THEORY_GROUP',
            totalHours: 30,
            instructor: {
                id: crypto.randomUUID(),
                name: 'Anna Nowak',
            },
        },
        {
            id: crypto.randomUUID(),
            name: `Jazdy praktyczne — demo (${short})`,
            category: 'B',
            type: 'PRACTICAL',
            totalHours: 30,
            instructor: null,
        },
        {
            id: crypto.randomUUID(),
            name: `Kurs dodatkowy — demo (${short})`,
            category: 'B',
            type: 'EXTRA',
            totalHours: 10,
            instructor: {
                id: crypto.randomUUID(),
                name: 'Piotr Kowalski',
            },
        },
    ];

    return store[schoolId]!;
}

function getOrCreateSchoolCoursesBucket(schoolId: string): MockCourseListRow[] {
    const store = getStore();

    if (!store[schoolId]) {
        store[schoolId] = [];
    }

    return store[schoolId]!;
}

function resolveMockCourseDetailCapacity(
    row: MockCourseListRow,
): number | null {
    if (row.type !== 'THEORY_GROUP') {
        return null;
    }

    if (row.capacity !== undefined) {
        return row.capacity;
    }

    return 24;
}

function resolveInstructorRefForSchool(
    schoolId: string,
    instructorProfileId: string | null,
): { id: string; name: string } | null {
    if (!instructorProfileId) {
        return null;
    }

    const rows = mockInstructorsListPayload(schoolId).instructors;
    const r = rows.find((x) => x.id === instructorProfileId);

    if (!r) {
        return {
            id: instructorProfileId,
            name: 'Instruktor',
        };
    }

    const parts = [r.firstName, r.lastName]
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    const name = parts.length > 0 ? parts.join(' ') : '—';

    return {
        id: instructorProfileId,
        name,
    };
}

/** Odpowiedź POST `/courses` (płaski DTO) wg courses-api.md. */
export interface MockCourseCreateResponse {
    id: string;
    name: string;
    category: string;
    kind: MockCourseListRow['type'];
    totalHours: number;
    capacity: number | null;
    theoryStartDate: string | null;
    theoryEndDate: string | null;
    schoolId: string;
    instructorId: string | null;
    status: string;
    createdAt: string;
}

export function mockCoursesPushCreate(
    schoolId: string,
    input: {
        name: string;
        category: string;
        kind: MockCourseListRow['type'];
        totalHours: number;
        capacity: number | null;
        theoryStartDate: string | null;
        theoryEndDate: string | null;
        instructorId: string | null;
    },
): MockCourseCreateResponse {
    const id = crypto.randomUUID();
    const instructorRef = resolveInstructorRefForSchool(
        schoolId,
        input.instructorId,
    );

    const listRow: MockCourseListRow = {
        id,
        name: input.name,
        category: input.category,
        type: input.kind,
        totalHours: input.totalHours,
        instructor: instructorRef,
    };

    if (input.kind === 'THEORY_GROUP') {
        listRow.capacity = input.capacity;
    }

    const bucket = getOrCreateSchoolCoursesBucket(schoolId);

    bucket.push(listRow);

    const createdAt = new Date().toISOString();

    return {
        id,
        name: input.name,
        category: input.category,
        kind: input.kind,
        totalHours: input.totalHours,
        capacity: input.kind === 'THEORY_GROUP' ? input.capacity : null,
        theoryStartDate:
            input.kind === 'THEORY_GROUP' ? input.theoryStartDate : null,
        theoryEndDate:
            input.kind === 'THEORY_GROUP' ? input.theoryEndDate : null,
        schoolId,
        instructorId: input.instructorId,
        status: 'ACTIVE',
        createdAt,
    };
}

/** Kształt `data.course` jak w GET `/courses/:id` wg courses-api.md (BE). */
export interface MockCourseDetailRow extends MockCourseListRow {
    capacity: number | null;
}

/** Szczegóły kursu z mocka (tylko istniejące ID z listy dla danego seeda). */
export function mockCoursesGetById(
    courseId: string,
): (MockCourseDetailRow & { schoolId: string }) | null {
    const id = courseId.trim();

    if (!id) {
        return null;
    }

    const store = getStore();

    for (const [schoolId, rows] of Object.entries(store)) {
        const row = rows.find((r) => r.id === id);

        if (!row) {
            continue;
        }

        return {
            ...row,
            capacity: resolveMockCourseDetailCapacity(row),
            schoolId,
        };
    }

    return null;
}

export type MockCoursesPatchInstructorOutcome =
    | { outcome: 'ok'; course: MockCourseDetailRow & { schoolId: string } }
    | { outcome: 'course_not_found' }
    | { outcome: 'instructor_not_in_school' };

/** PATCH instruktora (mock) — `instructorId` = profil lub null. */
export function mockCoursesPatchInstructor(
    courseId: string,
    instructorProfileId: string | null,
): MockCoursesPatchInstructorOutcome {
    const id = courseId.trim();

    if (!id) {
        return { outcome: 'course_not_found' };
    }

    const store = getStore();

    for (const [schoolId, rows] of Object.entries(store)) {
        const idx = rows.findIndex((r) => r.id === id);

        if (idx === -1) {
            continue;
        }

        if (
            instructorProfileId !== null &&
            !mockInstructorBelongsToSchool(schoolId, instructorProfileId)
        ) {
            return { outcome: 'instructor_not_in_school' };
        }

        const row = rows[idx]!;

        row.instructor = resolveInstructorRefForSchool(
            schoolId,
            instructorProfileId,
        );

        return {
            outcome: 'ok',
            course: {
                ...row,
                capacity: resolveMockCourseDetailCapacity(row),
                schoolId,
            },
        };
    }

    return { outcome: 'course_not_found' };
}

/** Kształt `data` jak w odpowiedzi BE listy kursów. */
export function mockCoursesListPayload(schoolId: string): {
    courses: MockCourseListRow[];
} {
    return {
        courses: ensureSeedForSchool(schoolId),
    };
}
