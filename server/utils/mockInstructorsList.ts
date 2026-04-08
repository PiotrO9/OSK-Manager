export interface MockInstructorListRow {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

type GlobalWithStore = typeof globalThis & {
    __mockInstructorsListBySchool?: Record<string, MockInstructorListRow[]>;
};

function getStore(): Record<string, MockInstructorListRow[]> {
    const g = globalThis as GlobalWithStore;

    if (!g.__mockInstructorsListBySchool) {
        g.__mockInstructorsListBySchool = {};
    }

    return g.__mockInstructorsListBySchool;
}

function ensureSeedForSchool(schoolId: string): MockInstructorListRow[] {
    const store = getStore();

    if (store[schoolId]?.length) {
        return store[schoolId]!;
    }

    const short = schoolId.replace(/-/g, '').slice(0, 8);

    store[schoolId] = [
        {
            id: crypto.randomUUID(),
            firstName: 'Anna',
            lastName: 'Nowak',
            email: `anna.nowak.${short}@example.com`,
        },
        {
            id: crypto.randomUUID(),
            firstName: 'Piotr',
            lastName: 'Kowalski',
            email: `piotr.kowalski.${short}@example.com`,
        },
    ];

    return store[schoolId]!;
}

/** Kształt `data` jak w odpowiedzi BE listy instruktorów. */
export function mockInstructorsListPayload(schoolId: string): {
    instructors: MockInstructorListRow[];
} {
    return {
        instructors: ensureSeedForSchool(schoolId),
    };
}
