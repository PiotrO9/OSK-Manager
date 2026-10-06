import { createError } from 'h3';
import {
    MOCK_DEFAULT_OFFERED_COURSE_TYPES,
    type MockDrivingSchoolOfferedType,
} from '~~/server/utils/schools/mockDrivingSchoolsStore';
import type { BffInstructorPatchBody } from './parseInstructorPatchBody';

export interface MockInstructorListRow {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
    qualifiedCourseTypes?: MockDrivingSchoolOfferedType[];
}

interface MockInstructorProfileExtras {
    qualifications: string;
    qualifiedCourseTypeIds: string[];
    experienceYears: number;
}

interface GlobalWithStore {
    __mockInstructorsListBySchool?: Record<string, MockInstructorListRow[]>;
    __mockInstructorProfileExtras?: Record<string, MockInstructorProfileExtras>;
}

function getStore(): Record<string, MockInstructorListRow[]> {
    const g = globalThis as typeof globalThis & GlobalWithStore;

    if (!g.__mockInstructorsListBySchool) {
        g.__mockInstructorsListBySchool = {};
    }

    return g.__mockInstructorsListBySchool;
}

function getExtrasMap(): Record<string, MockInstructorProfileExtras> {
    const g = globalThis as typeof globalThis & GlobalWithStore;

    if (!g.__mockInstructorProfileExtras) {
        g.__mockInstructorProfileExtras = {};
    }

    return g.__mockInstructorProfileExtras;
}

function removeProfileExtras(instructorId: string): void {
    const g = globalThis as typeof globalThis & GlobalWithStore;
    const { [instructorId]: _removed, ...rest } = getExtrasMap();

    g.__mockInstructorProfileExtras = rest;
}

function getDefaultProfileExtras(): MockInstructorProfileExtras {
    return {
        qualifications: 'Kat. B (demo)',
        qualifiedCourseTypeIds: [MOCK_DEFAULT_OFFERED_COURSE_TYPES[0]!.id],
        experienceYears: 5,
    };
}

function resolveMockQualifiedCourseTypes(
    ids: string[],
): MockDrivingSchoolOfferedType[] {
    const out: MockDrivingSchoolOfferedType[] = [];

    for (const id of ids) {
        const hit = MOCK_DEFAULT_OFFERED_COURSE_TYPES.find((t) => t.id === id);

        if (!hit) {
            throw createError({
                statusCode: 400,
                message: 'Invalid qualifiedCourseTypeIds',
            });
        }

        out.push(hit);
    }

    return out.sort((a, b) => a.code.localeCompare(b.code, 'pl'));
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
            avatarUrl: null,
        },
        {
            id: crypto.randomUUID(),
            firstName: 'Piotr',
            lastName: 'Kowalski',
            email: `piotr.kowalski.${short}@example.com`,
            avatarUrl: null,
        },
    ];

    return store[schoolId]!;
}

/** Kształt `data` jak w odpowiedzi BE listy instruktorów. */
export function mockInstructorsListPayload(schoolId: string): {
    instructors: MockInstructorListRow[];
} {
    return {
        instructors: ensureSeedForSchool(schoolId).map((row) => {
            const extras = getExtrasMap()[row.id] ?? getDefaultProfileExtras();

            return {
                ...row,
                qualifiedCourseTypes: resolveMockQualifiedCourseTypes(
                    extras.qualifiedCourseTypeIds,
                ),
            };
        }),
    };
}

/** Czy instruktor (identyfikator jak w liście / profilu mocka) jest przypisany do szkoły. */
export function mockInstructorBelongsToSchool(
    schoolId: string,
    instructorId: string,
): boolean {
    const sid = schoolId.trim();
    const iid = instructorId.trim();

    if (!sid || !iid) {
        return false;
    }

    return mockInstructorsListPayload(sid).instructors.some(
        (r) => r.id === iid,
    );
}

function findStoredRowById(
    id: string,
): { row: MockInstructorListRow; schoolId: string } | null {
    const store = getStore();

    for (const [schoolId, rows] of Object.entries(store)) {
        const row = rows.find((r) => r.id === id);

        if (row) {
            return { row, schoolId };
        }
    }

    return null;
}

function findRowById(
    id: string,
): (MockInstructorListRow & { schoolId: string }) | null {
    const found = findStoredRowById(id);

    return found ? { ...found.row, schoolId: found.schoolId } : null;
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
        qualifiedCourseTypeIds:
            patch.qualifiedCourseTypeIds !== undefined
                ? patch.qualifiedCourseTypeIds
                : prev.qualifiedCourseTypeIds,
        experienceYears:
            patch.experienceYears !== undefined
                ? patch.experienceYears
                : prev.experienceYears,
    };
}

/** Szczegóły instruktora — kształt zbliżony do GET /instructors/:id (mock). */
export interface MockInstructorDetailPayload {
    id: string;
    schoolId: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
    licenseNumber: string;
    phone: string;
    qualifications: string;
    qualifiedCourseTypes: MockDrivingSchoolOfferedType[];
    experienceYears: number;
}

/** Kształt odpowiedzi BE po PATCH (bez pól dostępnych tylko w GET). */
export interface MockInstructorPatchPayload {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    qualifications: string;
    qualifiedCourseTypes: MockDrivingSchoolOfferedType[];
    experienceYears: number;
}

function buildPatchPayload(
    row: MockInstructorListRow,
): MockInstructorPatchPayload {
    const extras = getExtrasMap()[row.id] ?? getDefaultProfileExtras();

    return {
        id: row.id,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        qualifications: extras.qualifications,
        qualifiedCourseTypes: resolveMockQualifiedCourseTypes(
            extras.qualifiedCourseTypeIds,
        ),
        experienceYears: extras.experienceYears,
    };
}

function buildDetailPayload(
    row: MockInstructorListRow & { schoolId: string },
): MockInstructorDetailPayload {
    const suffix = row.id.replace(/-/g, '').slice(0, 6);
    const extras = getExtrasMap()[row.id] ?? getDefaultProfileExtras();

    return {
        id: row.id,
        schoolId: row.schoolId,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        avatarUrl: row.avatarUrl,
        licenseNumber: `OSK-LIC-${suffix.toUpperCase()}`,
        phone: `+48 600 ${suffix.slice(0, 3)} ${suffix.slice(3, 6)}`,
        qualifications: extras.qualifications,
        qualifiedCourseTypes: resolveMockQualifiedCourseTypes(
            extras.qualifiedCourseTypeIds,
        ),
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
 * Częściowa aktualizacja profilu (mock). Zwraca kształt odpowiedzi BE PATCH lub null gdy brak id.
 */
export function mockInstructorsPatchById(
    id: string,
    patch: BffInstructorPatchBody,
): MockInstructorPatchPayload | null {
    const found = findStoredRowById(id);

    if (!found) {
        return null;
    }

    if (Object.keys(patch).length === 0) {
        return buildPatchPayload(found.row);
    }

    for (const key of ['firstName', 'lastName'] as const) {
        if (key in patch && (!patch[key] || !patch[key].trim())) {
            throw createError({
                statusCode: 400,
                message: `${key} must not be empty`,
            });
        }
    }

    if (
        'experienceYears' in patch &&
        (!Number.isInteger(patch.experienceYears) ||
            patch.experienceYears! < 0 ||
            patch.experienceYears! > 80)
    ) {
        throw createError({
            statusCode: 400,
            message: 'Invalid experienceYears',
        });
    }

    const extraPatch: Partial<MockInstructorProfileExtras> = {};

    if ('qualifications' in patch) {
        extraPatch.qualifications =
            patch.qualifications == null ? '' : String(patch.qualifications);
    }

    if ('qualifiedCourseTypeIds' in patch) {
        if (!Array.isArray(patch.qualifiedCourseTypeIds)) {
            throw createError({
                statusCode: 400,
                message: 'Invalid qualifiedCourseTypeIds',
            });
        }

        const ids = patch.qualifiedCourseTypeIds.map((item) => item.trim());

        resolveMockQualifiedCourseTypes(ids);
        extraPatch.qualifiedCourseTypeIds = ids;
    }

    if (
        'experienceYears' in patch &&
        typeof patch.experienceYears === 'number' &&
        Number.isInteger(patch.experienceYears)
    ) {
        extraPatch.experienceYears = patch.experienceYears;
    }

    // Wszystkie walidacje (zwłaszcza identyfikatorów kategorii) muszą
    // zakończyć się przed zmianą któregokolwiek z magazynów mocka.
    if (typeof patch.firstName === 'string') {
        found.row.firstName = patch.firstName.trim();
    }

    if (typeof patch.lastName === 'string') {
        found.row.lastName = patch.lastName.trim();
    }

    if (Object.keys(extraPatch).length > 0) {
        mergeProfileExtras(id, extraPatch);
    }

    return buildPatchPayload(found.row);
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
            removeProfileExtras(id);

            return true;
        }
    }

    return false;
}
