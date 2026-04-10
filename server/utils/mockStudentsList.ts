/** Wiersz listy kursantów — kształt elementu `data.data[]` wg students-api.md. */
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
                  mockStudentAssignedToCourse(row.id, courseId.trim()),
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
