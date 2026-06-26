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
    modelYear: number | null;
    mileageKm: number | null;
    photoUrl: string | null;
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
            modelYear: 2018,
            mileageKm: 125_000,
            photoUrl: null,
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
            modelYear: null,
            mileageKm: null,
            photoUrl: null,
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
        modelYear: row.modelYear,
        mileageKm: row.mileageKm,
    };
}

/** Kształt zbliżony do odpowiedzi BE `getVehicleById` (single resource). */
export function mockVehicleRowToDetailPayload(
    row: MockVehicleRow,
): Record<string, unknown> {
    return {
        id: row.id,
        schoolId: row.schoolId,
        name: row.name,
        registrationNumber: row.registrationNumber,
        isActive: row.status === 'ACTIVE',
        inspectionDate: row.inspectionDate,
        insuranceDate: row.insuranceDate,
        photoUrl: row.photoUrl,
        isDefault: row.isDefault,
        modelYear: row.modelYear,
        mileageKm: row.mileageKm,
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
    modelYear: number | null;
    mileageKm: number | null;
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
        modelYear: row.modelYear,
        mileageKm: row.mileageKm,
        photoUrl: null,
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
        modelYear: number | null;
        mileageKm: number | null;
    },
): MockVehicleRow | null {
    const store = getStore();
    const row = store.find((v) => v.id === id);

    if (!row) return null;

    row.name = body.name;
    row.registrationNumber = body.registrationNumber;
    row.inspectionDate = body.inspectionDate;
    row.insuranceDate = body.insuranceDate;
    row.modelYear = body.modelYear;
    row.mileageKm = body.mileageKm;

    return row;
}

export function mockVehiclesGetById(id: string): MockVehicleRow | null {
    const store = getStore();

    return store.find((v) => v.id === id) ?? null;
}

export function mockVehiclesSetDefault(id: string): boolean {
    const store = getStore();
    const target = store.find((v) => v.id === id);

    if (!target) {
        return false;
    }

    for (const row of store) {
        if (row.schoolId === target.schoolId) {
            row.isDefault = false;
        }
    }

    target.isDefault = true;

    return true;
}

/** Weryfikuje, że pojazd należy do podanej szkoły (zgodnie z kontraktem BFF). */
export function mockVehiclesSetDefaultForSchool(
    schoolId: string,
    vehicleId: string,
): boolean {
    const row = mockVehiclesGetById(vehicleId);

    if (!row || row.schoolId !== schoolId) {
        return false;
    }

    return mockVehiclesSetDefault(vehicleId);
}

export function mockVehiclesUpdateStatus(
    id: string,
    status: MockVehicleStatus,
): MockVehicleRow | null {
    const row = mockVehiclesGetById(id);

    if (!row) return null;

    row.status = status;

    return row;
}

export function mockVehiclesSetPhotoUrl(
    id: string,
    photoUrl: string,
): MockVehicleRow | null {
    const store = getStore();
    const row = store.find((v) => v.id === id);

    if (!row) return null;

    row.photoUrl = photoUrl;

    return row;
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
