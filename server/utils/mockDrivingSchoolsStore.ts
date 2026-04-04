export interface MockDrivingSchoolRow {
    id: string;
    name: string;
    city: string | null;
    address: string | null;
}

type GlobalWithStore = typeof globalThis & {
    __mockDrivingSchoolsStore?: MockDrivingSchoolRow[];
    __mockDrivingSchoolsDefaultId?: string | null;
};

function getStore(): MockDrivingSchoolRow[] {
    const g = globalThis as GlobalWithStore;

    if (!g.__mockDrivingSchoolsStore) {
        g.__mockDrivingSchoolsStore = [];
    }

    return g.__mockDrivingSchoolsStore;
}

function getDefaultId(): string | null {
    const g = globalThis as GlobalWithStore;

    return g.__mockDrivingSchoolsDefaultId ?? null;
}

function setDefaultId(id: string | null) {
    const g = globalThis as GlobalWithStore;

    g.__mockDrivingSchoolsDefaultId = id;
}

export function mockDrivingSchoolsList(): Array<
    MockDrivingSchoolRow & { isDefault: boolean }
> {
    const def = getDefaultId();

    return getStore().map((row) => ({
        ...row,
        isDefault: def !== null && row.id === def,
    }));
}

export function mockDrivingSchoolsGetDefault(): MockDrivingSchoolRow | null {
    const store = getStore();
    const def = getDefaultId();

    if (!def) {
        return null;
    }

    return store.find((s) => s.id === def) ?? null;
}

export function mockDrivingSchoolsPush(
    row: Omit<MockDrivingSchoolRow, 'id'>,
): MockDrivingSchoolRow {
    const store = getStore();
    const id = crypto.randomUUID();
    const created: MockDrivingSchoolRow = {
        id,
        ...row,
    };

    store.push(created);

    return created;
}

export function mockDrivingSchoolsDelete(id: string): boolean {
    const store = getStore();
    const index = store.findIndex((s) => s.id === id);

    if (index === -1) return false;

    store.splice(index, 1);

    if (getDefaultId() === id) {
        setDefaultId(null);
    }

    return true;
}

export function mockDrivingSchoolsUpdate(
    id: string,
    body: { name: string; city?: string | null; address?: string | null },
): MockDrivingSchoolRow | null {
    const store = getStore();
    const row = store.find((s) => s.id === id);

    if (!row) return null;

    row.name = body.name;
    row.city = body.city ?? null;
    row.address = body.address ?? null;

    return { ...row };
}

export function mockDrivingSchoolsSetDefault(id: string): boolean {
    const store = getStore();
    const exists = store.some((s) => s.id === id);

    if (!exists) return false;

    setDefaultId(id);

    return true;
}
