export type MockVehicleStatus = 'ACTIVE' | 'UNAVAILABLE';

export interface MockVehicleRow {
    id: string;
    schoolId: string;
    name: string;
    registrationNumber: string;
    status: MockVehicleStatus;
    isDefault: boolean;
    inspectionDate: string | null;
    insuranceDate: string | null;
}

type GlobalWithStore = typeof globalThis & {
    __mockVehiclesStore?: MockVehicleRow[];
};

function getStore(): MockVehicleRow[] {
    const g = globalThis as GlobalWithStore;

    if (!g.__mockVehiclesStore) {
        g.__mockVehiclesStore = [];
    }

    return g.__mockVehiclesStore;
}

function ensureSeedForSchool(schoolId: string) {
    const store = getStore();

    if (store.some((v) => v.schoolId === schoolId)) {
        return;
    }

    store.push(
        {
            id: crypto.randomUUID(),
            schoolId,
            name: 'Toyota Yaris',
            registrationNumber: 'KR 12345',
            status: 'ACTIVE',
            isDefault: true,
            inspectionDate: '2025-06-15',
            insuranceDate: '2025-12-01',
        },
        {
            id: crypto.randomUUID(),
            schoolId,
            name: 'Skoda Octavia — pojazd szkoleniowy z bardzo długą nazwą do testu UI',
            registrationNumber: 'WW 99999',
            status: 'UNAVAILABLE',
            isDefault: false,
            inspectionDate: '2024-03-20',
            insuranceDate: null,
        },
    );
}

function rowToResponse(row: MockVehicleRow): Record<string, unknown> {
    return {
        id: row.id,
        name: row.name,
        registrationNumber: row.registrationNumber,
        status: row.status,
        isDefault: row.isDefault,
        inspectionDate: row.inspectionDate,
        insuranceDate: row.insuranceDate,
    };
}

export function mockVehiclesListForSchool(schoolId: string): unknown[] {
    ensureSeedForSchool(schoolId);

    const store = getStore();

    return store
        .filter((v) => v.schoolId === schoolId)
        .map((row) => rowToResponse(row));
}

export function mockVehiclesCreate(row: {
    schoolId: string;
    name: string;
    registrationNumber: string;
    inspectionDate: string | null;
    insuranceDate: string | null;
}): MockVehicleRow {
    const store = getStore();
    const id = crypto.randomUUID();
    const created: MockVehicleRow = {
        id,
        schoolId: row.schoolId,
        name: row.name,
        registrationNumber: row.registrationNumber,
        status: 'ACTIVE',
        isDefault: false,
        inspectionDate: row.inspectionDate,
        insuranceDate: row.insuranceDate,
    };

    store.push(created);

    return created;
}

export function mockVehiclesFindDuplicateRegistration(
    schoolId: string,
    registrationNumber: string,
    excludeId?: string,
): boolean {
    const t = registrationNumber.trim().toLowerCase();
    const store = getStore();

    return store.some(
        (v) =>
            v.schoolId === schoolId &&
            v.registrationNumber.trim().toLowerCase() === t &&
            v.id !== excludeId,
    );
}

export function mockVehiclesUpdate(
    id: string,
    body: {
        name: string;
        registrationNumber: string;
        inspectionDate: string | null;
        insuranceDate: string | null;
    },
): MockVehicleRow | null {
    const store = getStore();
    const row = store.find((v) => v.id === id);

    if (!row) return null;

    row.name = body.name;
    row.registrationNumber = body.registrationNumber;
    row.inspectionDate = body.inspectionDate;
    row.insuranceDate = body.insuranceDate;

    return row;
}

export function mockVehiclesGetById(id: string): MockVehicleRow | null {
    const store = getStore();

    return store.find((v) => v.id === id) ?? null;
}

export function mockVehiclesDelete(id: string): boolean {
    const store = getStore();
    const index = store.findIndex((v) => v.id === id);

    if (index === -1) return false;

    store.splice(index, 1);

    return true;
}

export function mockVehiclesResponseFromRow(
    row: MockVehicleRow,
): Record<string, unknown> {
    return rowToResponse(row);
}
