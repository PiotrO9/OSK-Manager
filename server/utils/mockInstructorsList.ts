export interface MockInstructorListRow {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

type MockInstructorProfileExtras = {
    qualifications: string;
    experienceYears: number;
};

type GlobalWithStore = typeof globalThis & {
    __mockInstructorsListBySchool?: Record<string, MockInstructorListRow[]>;
    __mockInstructorProfileExtras?: Record<string, MockInstructorProfileExtras>;
};

function getStore(): Record<string, MockInstructorListRow[]> {
    const g = globalThis as GlobalWithStore;

    if (!g.__mockInstructorsListBySchool) {
        g.__mockInstructorsListBySchool = {};
    }

    return g.__mockInstructorsListBySchool;
}

function getExtrasMap(): Record<string, MockInstructorProfileExtras> {
    const g = globalThis as GlobalWithStore;

    if (!g.__mockInstructorProfileExtras) {
        g.__mockInstructorProfileExtras = {};
    }

    return g.__mockInstructorProfileExtras;
}

function getDefaultProfileExtras(): MockInstructorProfileExtras {
    return {
        qualifications: 'Kat. B (demo)',
        experienceYears: 5,
    };
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

function findRowById(id: string): MockInstructorListRow | null {
    const store = getStore();

    for (const rows of Object.values(store)) {
        const row = rows.find((r) => r.id === id);

        if (row) {
            return row;
        }
    }

    return null;
}

function mergeProfileExtras(
    instructorId: string,
    patch: Partial<MockInstructorProfileExtras>,
): void {
    const map = getExtrasMap();
    const prev = map[instructorId] ?? getDefaultProfileExtras();

    map[instructorId] = {
        qualifications:
            patch.qualifications !== undefined
                ? patch.qualifications
                : prev.qualifications,
        experienceYears:
            patch.experienceYears !== undefined
                ? patch.experienceYears
                : prev.experienceYears,
    };
}

/** Szczegóły instruktora — kształt zbliżony do GET /instructors/:id (mock). */
export interface MockInstructorDetailPayload {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    licenseNumber: string;
    phone: string;
    qualifications: string;
    experienceYears: number;
}

function buildDetailPayload(
    row: MockInstructorListRow,
): MockInstructorDetailPayload {
    const suffix = row.id.replace(/-/g, '').slice(0, 6);
    const extras = getExtrasMap()[row.id] ?? getDefaultProfileExtras();

    return {
        id: row.id,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        licenseNumber: `OSK-LIC-${suffix.toUpperCase()}`,
        phone: `+48 600 ${suffix.slice(0, 3)} ${suffix.slice(3, 6)}`,
        qualifications: extras.qualifications,
        experienceYears: extras.experienceYears,
    };
}

export function mockInstructorsGetById(
    id: string,
): MockInstructorDetailPayload | null {
    const row = findRowById(id);

    if (!row) {
        return null;
    }

    return buildDetailPayload(row);
}

/**
 * Częściowa aktualizacja profilu (mock). Zwraca aktualny stan jak po GET lub null gdy brak id.
 */
export function mockInstructorsPatchById(
    id: string,
    patch: Record<string, unknown>,
): MockInstructorDetailPayload | null {
    const row = findRowById(id);

    if (!row) {
        return null;
    }

    if (Object.keys(patch).length === 0) {
        return buildDetailPayload(row);
    }

    if (typeof patch.firstName === 'string') {
        row.firstName = patch.firstName.trim();
    }

    if (typeof patch.lastName === 'string') {
        row.lastName = patch.lastName.trim();
    }

    const extraPatch: Partial<MockInstructorProfileExtras> = {};

    if ('qualifications' in patch) {
        extraPatch.qualifications =
            patch.qualifications == null ? '' : String(patch.qualifications);
    }

    if (
        'experienceYears' in patch &&
        typeof patch.experienceYears === 'number' &&
        Number.isInteger(patch.experienceYears)
    ) {
        extraPatch.experienceYears = patch.experienceYears;
    }

    if (Object.keys(extraPatch).length > 0) {
        mergeProfileExtras(id, extraPatch);
    }

    const updated = findRowById(id);

    if (!updated) {
        return null;
    }

    return buildDetailPayload(updated);
}

/** Usuwa instruktora z mockowej listy (wszystkie szkoły). Zwraca true gdy usunięto wiersz. */
export function mockInstructorsDeleteById(id: string): boolean {
    const store = getStore();

    for (const schoolId of Object.keys(store)) {
        const rows = store[schoolId];

        if (!rows?.length) {
            continue;
        }

        const idx = rows.findIndex((r) => r.id === id);

        if (idx !== -1) {
            rows.splice(idx, 1);
            const extras = getExtrasMap();

            delete extras[id];

            return true;
        }
    }

    return false;
}
