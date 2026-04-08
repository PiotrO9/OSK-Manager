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

/** Szczegóły instruktora — zgodnie z GET /instructors/:id (mock). */
export interface MockInstructorDetailPayload {
    id: string;
    name: string;
    email: string;
    licenseNumber: string;
    phone: string;
    qualifications: string;
    experience: string;
}

export function mockInstructorsGetById(
    id: string,
): MockInstructorDetailPayload | null {
    const store = getStore();

    for (const rows of Object.values(store)) {
        const row = rows.find((r) => r.id === id);

        if (!row) {
            continue;
        }

        const parts = [row.firstName, row.lastName]
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        const name = parts.length > 0 ? parts.join(' ') : '—';

        const suffix = row.id.replace(/-/g, '').slice(0, 6);

        return {
            id: row.id,
            name,
            email: row.email,
            licenseNumber: `OSK-LIC-${suffix.toUpperCase()}`,
            phone: `+48 600 ${suffix.slice(0, 3)} ${suffix.slice(3, 6)}`,
            qualifications: 'Kat. B (demo)',
            experience: '5 lat (demo)',
        };
    }

    return null;
}
