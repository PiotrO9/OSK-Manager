import { describe, expect, it } from 'vitest';
import type { InstructorEditFormModel } from '~/types/instructors/instructor';
import {
    buildManagerInstructorDirtyPatch,
    validateManagerInstructorPatch,
} from '~/utils/instructors/managerInstructorDetailsPage';

const baseInstructorForm: InstructorEditFormModel = {
    id: 'instructor-1',
    firstName: 'Anna',
    lastName: 'Nowak',
    email: 'anna@example.com',
    qualifications: 'Kat. B',
    qualifiedCourseTypeIds: ['course-b'],
    experienceYears: 5,
};

describe('manager instructor details patch helpers', () => {
    it('returns null when instructor edit form has no changes', () => {
        expect(
            buildManagerInstructorDirtyPatch(
                { ...baseInstructorForm },
                baseInstructorForm,
            ),
        ).toBeNull();
    });

    it('returns only changed instructor fields and normalizes course type ids', () => {
        expect(
            buildManagerInstructorDirtyPatch(
                {
                    ...baseInstructorForm,
                    firstName: ' Anna Maria ',
                    qualifiedCourseTypeIds: ['course-c', ' course-b '],
                    experienceYears: 6,
                },
                baseInstructorForm,
            ),
        ).toEqual({
            firstName: 'Anna Maria',
            qualifiedCourseTypeIds: ['course-b', 'course-c'],
            experienceYears: 6,
        });
    });

    it('validates empty required patch fields', () => {
        expect(validateManagerInstructorPatch({ firstName: '   ' })).toBe(
            'Imię nie może być puste.',
        );
        expect(validateManagerInstructorPatch({ experienceYears: 81 })).toBe(
            'Staż musi być liczbą całkowitą od 0 do 80.',
        );
    });
});
