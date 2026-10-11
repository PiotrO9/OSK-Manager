export interface MockDrivingSchoolOfferedType {
    id: string;
    code: string;
    name: string;
}

/**
 * Przykładowa oferta kategorii w mocku (jak rozwiązane refs do CourseType po stronie BE).
 * Nowa szkoła w mocku startuje z tą listą, żeby można było tworzyć kursy lokalnie.
 */
export const MOCK_DEFAULT_OFFERED_COURSE_TYPES: MockDrivingSchoolOfferedType[] =
    [
        {
            id: 'a4444444-4444-4444-8444-444444444444',
            code: 'A',
            name: 'Kategoria A',
        },
        {
            id: 'a1111111-1111-4111-8111-111111111111',
            code: 'B',
            name: 'Kategoria B',
        },
        {
            id: 'a2222222-2222-4222-8222-222222222222',
            code: 'C',
            name: 'Kategoria C',
        },
        {
            id: 'a3333333-3333-4333-8333-333333333333',
            code: 'CE',
            name: 'Kategoria CE',
        },
    ];

export const MOCK_DEFAULT_ENABLED_COURSE_KINDS = [
    'THEORY_GROUP',
    'PRACTICAL',
    'EXTRA',
] as const;

export interface MockDrivingSchoolRow {
    id: string;
    name: string;
    city: string | null;
    address: string | null;
    offeredCourseTypes?: MockDrivingSchoolOfferedType[];
    enabledCourseKinds?: (typeof MOCK_DEFAULT_ENABLED_COURSE_KINDS)[number][];
}

type GlobalWithStore = typeof globalThis & {
    __mockDrivingSchoolsStore?: MockDrivingSchoolRow[];
    __mockDrivingSchoolsDefaultId?: string | null;
};

function getStore(): MockDrivingSchoolRow[] {
    const globalStore = globalThis as GlobalWithStore;

    if (!globalStore.__mockDrivingSchoolsStore) {
        globalStore.__mockDrivingSchoolsStore = [];
    }

    return globalStore.__mockDrivingSchoolsStore;
}

function getDefaultId(): string | null {
    const globalStore = globalThis as GlobalWithStore;

    return globalStore.__mockDrivingSchoolsDefaultId ?? null;
}

function setDefaultId(id: string | null) {
    const globalStore = globalThis as GlobalWithStore;

    globalStore.__mockDrivingSchoolsDefaultId = id;
}

export function mockDrivingSchoolsList(): Array<
    MockDrivingSchoolRow & { isDefault: boolean }
> {
    const defaultSchoolId = getDefaultId();

    return getStore().map((row) => ({
        ...row,
        offeredCourseTypes: row.offeredCourseTypes ?? [
            ...MOCK_DEFAULT_OFFERED_COURSE_TYPES,
        ],
        enabledCourseKinds: row.enabledCourseKinds ?? [
            ...MOCK_DEFAULT_ENABLED_COURSE_KINDS,
        ],
        isDefault: defaultSchoolId !== null && row.id === defaultSchoolId,
    }));
}

export function mockDrivingSchoolsGetDefault(): MockDrivingSchoolRow | null {
    const store = getStore();
    const defaultSchoolId = getDefaultId();

    if (!defaultSchoolId) {
        return null;
    }

    const row = store.find((school) => school.id === defaultSchoolId);

    if (!row) {
        return null;
    }

    return {
        ...row,
        offeredCourseTypes: row.offeredCourseTypes ?? [
            ...MOCK_DEFAULT_OFFERED_COURSE_TYPES,
        ],
        enabledCourseKinds: row.enabledCourseKinds ?? [
            ...MOCK_DEFAULT_ENABLED_COURSE_KINDS,
        ],
    };
}

export function mockDrivingSchoolsPush(row: {
    name: string;
    city: string | null;
    address: string | null;
}): MockDrivingSchoolRow {
    const store = getStore();
    const id = crypto.randomUUID();
    const created: MockDrivingSchoolRow = {
        id,
        name: row.name,
        city: row.city,
        address: row.address,
        offeredCourseTypes: [...MOCK_DEFAULT_OFFERED_COURSE_TYPES],
        enabledCourseKinds: [...MOCK_DEFAULT_ENABLED_COURSE_KINDS],
    };

    store.push(created);

    return created;
}

export function mockDrivingSchoolsDelete(id: string): boolean {
    const store = getStore();
    const index = store.findIndex((school) => school.id === id);

    if (index === -1) return false;

    store.splice(index, 1);

    if (getDefaultId() === id) {
        setDefaultId(null);
    }

    return true;
}

export function mockDrivingSchoolsUpdate(
    id: string,
    body: {
        name: string;
        city?: string | null;
        address?: string | null;
        enabledCourseKinds?: (typeof MOCK_DEFAULT_ENABLED_COURSE_KINDS)[number][];
        offeredCourseTypeIds?: string[];
    },
): MockDrivingSchoolRow | null {
    const store = getStore();
    const row = store.find((school) => school.id === id);

    if (!row) return null;

    const offeredTypes = body.offeredCourseTypeIds?.map((courseTypeId) =>
        MOCK_DEFAULT_OFFERED_COURSE_TYPES.find(
            (type) => type.id === courseTypeId,
        ),
    );

    if (offeredTypes?.some((type) => type === undefined)) return null;

    row.name = body.name;
    row.city = body.city ?? null;
    row.address = body.address ?? null;

    if (body.enabledCourseKinds !== undefined) {
        row.enabledCourseKinds = [...body.enabledCourseKinds];
    }

    if (offeredTypes !== undefined) {
        row.offeredCourseTypes = offeredTypes.filter(
            (type): type is MockDrivingSchoolOfferedType => type !== undefined,
        );
    }

    return { ...row };
}

export function mockDrivingSchoolsSetDefault(id: string): boolean {
    const store = getStore();
    const exists = store.some((school) => school.id === id);

    if (!exists) return false;

    setDefaultId(id);

    return true;
}
