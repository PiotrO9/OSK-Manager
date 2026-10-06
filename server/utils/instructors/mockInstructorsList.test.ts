import { beforeEach, describe, expect, it } from 'vitest';
import { MOCK_DEFAULT_OFFERED_COURSE_TYPES } from '~~/server/utils/schools/mockDrivingSchoolsStore';
import {
    mockInstructorsGetById,
    mockInstructorsListPayload,
    mockInstructorsPatchById,
} from './mockInstructorsList';

interface MockStoreGlobals {
    __mockInstructorsListBySchool?: unknown;
    __mockInstructorProfileExtras?: unknown;
}

describe('mockInstructorsPatchById', () => {
    beforeEach(() => {
        const globals = globalThis as typeof globalThis & MockStoreGlobals;

        delete globals.__mockInstructorsListBySchool;
        delete globals.__mockInstructorProfileExtras;
    });

    it('persists a valid update in GET and list, returning the BE PATCH shape', () => {
        const schoolId = 'school-1';
        const id = mockInstructorsListPayload(schoolId).instructors[0]!.id;
        const before = mockInstructorsGetById(id)!;
        const courseType = MOCK_DEFAULT_OFFERED_COURSE_TYPES[0]!;

        const result = mockInstructorsPatchById(id, {
            firstName: 'Maria',
            lastName: 'Kowalska',
            qualifications: 'Kat. B i C',
            qualifiedCourseTypeIds: [courseType.id],
            experienceYears: 8,
        });

        expect(result).toEqual({
            id,
            firstName: 'Maria',
            lastName: 'Kowalska',
            email: before.email,
            qualifications: 'Kat. B i C',
            qualifiedCourseTypes: [courseType],
            experienceYears: 8,
        });
        expect(mockInstructorsGetById(id)).toMatchObject({
            firstName: 'Maria',
            lastName: 'Kowalska',
            qualifications: 'Kat. B i C',
            experienceYears: 8,
            phone: before.phone,
            licenseNumber: before.licenseNumber,
        });
        expect(
            mockInstructorsListPayload(schoolId).instructors[0],
        ).toMatchObject({
            firstName: 'Maria',
            lastName: 'Kowalska',
        });
    });

    it('rejects a mixed invalid patch without persisting any fields', () => {
        const schoolId = 'school-1';
        const id = mockInstructorsListPayload(schoolId).instructors[0]!.id;
        const before = mockInstructorsGetById(id);
        const listBefore = mockInstructorsListPayload(schoolId);

        expect(() =>
            mockInstructorsPatchById(id, {
                firstName: 'Maria',
                experienceYears: 8,
                qualifiedCourseTypeIds: [
                    '00000000-0000-4000-8000-000000000000',
                ],
            }),
        ).toThrowError(/Invalid qualifiedCourseTypeIds/);
        expect(mockInstructorsGetById(id)).toEqual(before);
        expect(mockInstructorsListPayload(schoolId)).toEqual(listBefore);
    });

    it('validates scalar fields before updating the store', () => {
        const schoolId = 'school-1';
        const id = mockInstructorsListPayload(schoolId).instructors[0]!.id;
        const before = mockInstructorsGetById(id);

        expect(() =>
            mockInstructorsPatchById(id, {
                firstName: 'Maria',
                lastName: '   ',
                experienceYears: 8,
            }),
        ).toThrowError(/lastName must not be empty/);
        expect(() =>
            mockInstructorsPatchById(id, {
                firstName: 'Maria',
                experienceYears: 81,
            }),
        ).toThrowError(/Invalid experienceYears/);
        expect(mockInstructorsGetById(id)).toEqual(before);
    });
});
