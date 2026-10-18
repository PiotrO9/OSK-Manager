import { createError } from 'h3';
import {
    MOCK_DEFAULT_OFFERED_COURSE_TYPES,
    type MockDrivingSchoolOfferedType,
} from '../schools/mockDrivingSchoolsStore';

function resolveCategories(ids: string[]): MockDrivingSchoolOfferedType[] {
    return [...new Set(ids)].map((id) => {
        const type = MOCK_DEFAULT_OFFERED_COURSE_TYPES.find(
            (type) => type.id === id,
        );

        if (!type)
            throw createError({
                statusCode: 400,
                message: 'Nieznana kategoria pojazdu.',
            });

        return { ...type };
    });
}

export type MockVehicleStatus = 'ACTIVE' | 'UNAVAILABLE';

export interface MockVehicleRow {
    supportedCourseTypes: MockDrivingSchoolOfferedType[];
    id: string;
    schoolId: string;
    name: string;
    registrationNumber: string;
    status: MockVehicleStatus;
    unavailableUntil: string | null;
    isDefault: boolean;
    inspectionDate: string | null;
    insuranceDate: string | null;
    modelYear: number | null;
    mileageKm: number | null;
    photoUrl: string | null;
    updatedAt: string | null;
}

type GlobalWithStore = typeof globalThis & {
    __mockVehiclesStore?: MockVehicleRow[];
};

function getStore(): MockVehicleRow[] {
    const globalStore = globalThis as GlobalWithStore;

    if (!globalStore.__mockVehiclesStore) {
        globalStore.__mockVehiclesStore = [];
    }

    return globalStore.__mockVehiclesStore;
}

function ensureSeedForSchool(schoolId: string) {
    const store = getStore();

    if (store.some((vehicle) => vehicle.schoolId === schoolId)) {
        return;
    }

    store.push(
        {
            id: crypto.randomUUID(),
            schoolId,
            name: 'Toyota Yaris',
            supportedCourseTypes: resolveCategories([
                'a1111111-1111-4111-8111-111111111111',
            ]),
            registrationNumber: 'KR 12345',
            status: 'ACTIVE',
            unavailableUntil: null,
            isDefault: true,
            inspectionDate: '2025-06-15',
            insuranceDate: '2025-12-01',
            modelYear: 2018,
            mileageKm: 125_000,
            photoUrl: null,
            updatedAt: null,
        },
        {
            id: crypto.randomUUID(),
            schoolId,
            name: 'Skoda Octavia — pojazd szkoleniowy z bardzo długą nazwą do testu UI',
            supportedCourseTypes: [],
            registrationNumber: 'WW 99999',
            status: 'UNAVAILABLE',
            unavailableUntil: null,
            isDefault: false,
            inspectionDate: '2024-03-20',
            insuranceDate: null,
            modelYear: null,
            mileageKm: null,
            photoUrl: null,
            updatedAt: null,
        },
    );
}

function rowToResponse(row: MockVehicleRow): Record<string, unknown> {
    return {
        id: row.id,
        supportedCourseTypes: row.supportedCourseTypes,
        name: row.name,
        registrationNumber: row.registrationNumber,
        status: row.status,
        unavailableUntil: row.unavailableUntil,
        isDefault: row.isDefault,
        inspectionDate: row.inspectionDate,
        insuranceDate: row.insuranceDate,
        modelYear: row.modelYear,
        mileageKm: row.mileageKm,
        updatedAt: row.updatedAt,
    };
}

/** Kształt zbliżony do odpowiedzi BE `getVehicleById` (single resource). */
export function mockVehicleRowToDetailPayload(
    row: MockVehicleRow,
): Record<string, unknown> {
    return {
        id: row.id,
        supportedCourseTypes: row.supportedCourseTypes,
        schoolId: row.schoolId,
        name: row.name,
        registrationNumber: row.registrationNumber,
        isActive: row.status === 'ACTIVE',
        status: row.status,
        unavailableUntil: row.unavailableUntil,
        inspectionDate: row.inspectionDate,
        insuranceDate: row.insuranceDate,
        photoUrl: row.photoUrl,
        isDefault: row.isDefault,
        modelYear: row.modelYear,
        mileageKm: row.mileageKm,
        updatedAt: row.updatedAt,
    };
}

export function mockVehiclesListForSchool(schoolId: string): unknown[] {
    ensureSeedForSchool(schoolId);

    const store = getStore();

    return store
        .filter((vehicle) => vehicle.schoolId === schoolId)
        .map((row) => rowToResponse(row));
}

export function mockVehiclesCreate(row: {
    supportedCourseTypeIds?: string[];
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
        supportedCourseTypes: resolveCategories(
            row.supportedCourseTypeIds ?? [],
        ),
        id,
        schoolId: row.schoolId,
        name: row.name,
        registrationNumber: row.registrationNumber,
        status: 'ACTIVE',
        unavailableUntil: null,
        isDefault: false,
        inspectionDate: row.inspectionDate,
        insuranceDate: row.insuranceDate,
        modelYear: row.modelYear,
        mileageKm: row.mileageKm,
        photoUrl: null,
        updatedAt: new Date().toISOString(),
    };

    store.push(created);

    return created;
}

export function mockVehiclesFindDuplicateRegistration(
    schoolId: string,
    registrationNumber: string,
    excludeId?: string,
): boolean {
    const normalizedRegistrationNumber = registrationNumber
        .trim()
        .toLowerCase();
    const store = getStore();

    return store.some(
        (vehicle) =>
            vehicle.schoolId === schoolId &&
            vehicle.registrationNumber.trim().toLowerCase() ===
                normalizedRegistrationNumber &&
            vehicle.id !== excludeId,
    );
}

export function mockVehiclesUpdate(
    id: string,
    body: {
        supportedCourseTypeIds?: string[];
        name: string;
        registrationNumber: string;
        inspectionDate: string | null;
        insuranceDate: string | null;
        modelYear: number | null;
        mileageKm: number | null;
    },
): MockVehicleRow | null {
    const store = getStore();
    const row = store.find((vehicle) => vehicle.id === id);

    if (!row) return null;

    if (body.supportedCourseTypeIds !== undefined)
        row.supportedCourseTypes = resolveCategories(
            body.supportedCourseTypeIds,
        );

    row.name = body.name;
    row.registrationNumber = body.registrationNumber;
    row.inspectionDate = body.inspectionDate;
    row.insuranceDate = body.insuranceDate;
    row.modelYear = body.modelYear;
    row.mileageKm = body.mileageKm;
    row.updatedAt = new Date().toISOString();

    return row;
}

export function mockVehiclesGetById(id: string): MockVehicleRow | null {
    const store = getStore();

    return store.find((vehicle) => vehicle.id === id) ?? null;
}

export function mockVehiclesSetDefault(id: string): boolean {
    const store = getStore();
    const target = store.find((vehicle) => vehicle.id === id);

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
    body: {
        status: MockVehicleStatus;
        unavailableUntil?: string | null;
    },
): MockVehicleRow | null {
    const row = mockVehiclesGetById(id);

    if (!row) return null;

    row.status = body.status;
    row.unavailableUntil =
        body.status === 'UNAVAILABLE' ? (body.unavailableUntil ?? null) : null;
    row.updatedAt = new Date().toISOString();

    return row;
}

export function mockVehiclesSetPhotoUrl(
    id: string,
    photoUrl: string,
): MockVehicleRow | null {
    const store = getStore();
    const row = store.find((vehicle) => vehicle.id === id);

    if (!row) return null;

    row.photoUrl = photoUrl;
    row.updatedAt = new Date().toISOString();

    return row;
}

export function mockVehiclesDelete(id: string): boolean {
    const store = getStore();
    const index = store.findIndex((vehicle) => vehicle.id === id);

    if (index === -1) return false;

    store.splice(index, 1);

    return true;
}

export function mockVehiclesResponseFromRow(
    row: MockVehicleRow,
): Record<string, unknown> {
    return rowToResponse(row);
}
