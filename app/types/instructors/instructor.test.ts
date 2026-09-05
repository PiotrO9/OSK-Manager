import { describe, expect, it } from 'vitest';
import {
    formatInstructorDisplayName,
    normalizeInstructorDetail,
    normalizeInstructorDetailForEdit,
    normalizeInstructorsList,
    resolveInstructorProfileIdForCourseSelection,
} from './instructor';

describe('instructor domain types', () => {
    it('normalizes instructor detail for display and edit form', () => {
        const raw = {
            id: ' instructor-1 ',
            name: ' Anna Nowak ',
            first_name: ' Anna ',
            last_name: ' Nowak ',
            email: ' anna@example.test ',
            license_number: ' LIC-1 ',
            phone_number: ' 123 ',
            qualifications: ' Kat. B ',
            experience_years: '12',
            qualifiedCourseTypes: [
                { id: 'type-b', code: 'B', name: 'Kategoria B' },
            ],
        };

        expect(normalizeInstructorDetail(raw)).toMatchObject({
            id: 'instructor-1',
            name: 'Anna Nowak',
            email: 'anna@example.test',
            licenseNumber: 'LIC-1',
            phone: '123',
            qualifications: 'Kat. B',
            experience: '12 lat',
        });

        expect(normalizeInstructorDetailForEdit(raw)).toEqual({
            id: 'instructor-1',
            firstName: 'Anna',
            lastName: 'Nowak',
            email: 'anna@example.test',
            qualifications: 'Kat. B',
            qualifiedCourseTypeIds: ['type-b'],
            experienceYears: 12,
        });
    });

    it('normalizes list payloads and resolves profile id for course instructor', () => {
        const instructors = normalizeInstructorsList({
            instructors: [
                {
                    id: 'user-1',
                    instructor_profile_id: 'profile-1',
                    first_name: ' Anna ',
                    last_name: ' Nowak ',
                    email: ' anna@example.test ',
                    user: { id: 'user-1' },
                },
            ],
        });

        expect(instructors).toHaveLength(1);
        expect(formatInstructorDisplayName(instructors[0]!)).toBe('Anna Nowak');
        expect(
            resolveInstructorProfileIdForCourseSelection(
                { id: 'user-1', name: 'Anna Nowak' },
                instructors,
            ),
        ).toBe('profile-1');
    });
});
