/** Kształt pojedynczego kursu w `data.courses` wg courses-api.md (BE). */
export interface MockCourseListRow {
    id: string;
    name: string;
    category: string;
    type: 'THEORY_GROUP' | 'PRACTICAL' | 'EXTRA';
    totalHours: number;
    instructor: { id: string; name: string } | null;
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

/** Kształt `data` jak w odpowiedzi BE listy kursów. */
export function mockCoursesListPayload(schoolId: string): {
    courses: MockCourseListRow[];
} {
    return {
        courses: ensureSeedForSchool(schoolId),
    };
}
