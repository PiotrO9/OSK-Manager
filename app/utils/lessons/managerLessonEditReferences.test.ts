import { describe, expect, it } from 'vitest';
import {
    buildManagerLessonInstructorsForSelect,
    buildManagerLessonVehiclesForSelect,
    isManagerLessonInstructorEligible,
    parseInstructorListItemFromApi,
} from '~/utils/lessons/managerLessonEditReferences';
import type { InstructorListItem } from '~/types/instructors/instructor';
import type { Vehicle } from '~/types/vehicles/vehicle';

const instructor: InstructorListItem = {
    id: 'instructor-1',
    firstName: 'Jan',
    lastName: 'Kowalski',
    email: 'jan@example.test',
    avatarUrl: null,
};

const vehicle: Vehicle = {
    id: 'vehicle-1',
    name: 'Toyota Yaris',
    registrationNumber: 'WA12345',
    status: 'ACTIVE',
    unavailableUntil: null,
    isDefault: false,
    inspectionDate: null,
    insuranceDate: null,
    modelYear: null,
    mileageKm: null,
};

describe('manager lesson edit reference helpers', () => {
    it('normalizes nested instructor payload variants', () => {
        expect(
            parseInstructorListItemFromApi({
                id: ' instructor-1 ',
                first_name: ' Jan ',
                last_name: ' Kowalski ',
                Email: ' jan@example.test ',
                avatarUrl: ' ',
            }),
        ).toEqual(instructor);
    });

    it('prepends a synthetic instructor when the selected one is missing', () => {
        expect(
            buildManagerLessonInstructorsForSelect({
                instructors: [instructor],
                selectedInstructorId: 'instructor-2',
                fallbackLabel: 'Anna Nowak',
            }),
        ).toEqual([
            {
                id: 'instructor-2',
                firstName: 'Anna Nowak',
                lastName: '',
                email: '',
                avatarUrl: null,
            },
            instructor,
        ]);
    });

    it('keeps the existing instructor list when the selected one is present', () => {
        expect(
            buildManagerLessonInstructorsForSelect({
                instructors: [instructor],
                selectedInstructorId: 'instructor-1',
                fallbackLabel: 'Anna Nowak',
            }),
        ).toEqual([instructor]);
    });

    it('shows only the course instructor and a previously selected instructor', () => {
        const assigned = {
            ...instructor,
            id: 'instructor-2',
            firstName: 'Anna',
        };
        const unrelated = {
            ...instructor,
            id: 'instructor-3',
            firstName: 'Ola',
        };

        expect(
            buildManagerLessonInstructorsForSelect({
                instructors: [instructor, assigned, unrelated],
                selectedInstructorId: instructor.id,
                assignedInstructorId: assigned.id,
            }),
        ).toEqual([instructor, assigned]);
    });

    it('keeps the assigned instructor available when missing from the school list', () => {
        expect(
            buildManagerLessonInstructorsForSelect({
                instructors: [instructor],
                selectedInstructorId: instructor.id,
                assignedInstructorId: 'instructor-2',
                assignedInstructor: {
                    id: 'instructor-2',
                    name: 'Anna Nowak',
                },
            }).map((item) => ({ id: item.id, firstName: item.firstName })),
        ).toEqual([
            { id: instructor.id, firstName: instructor.firstName },
            { id: 'instructor-2', firstName: 'Anna Nowak' },
        ]);
    });

    it('recognizes an instructor fixed by the course', () => {
        expect(isManagerLessonInstructorEligible('instructor-2', null)).toBe(
            true,
        );
        expect(
            isManagerLessonInstructorEligible('instructor-2', 'instructor-1'),
        ).toBe(false);
        expect(
            isManagerLessonInstructorEligible('instructor-1', 'instructor-1'),
        ).toBe(true);
    });

    it('prepends a synthetic vehicle from fallback data when missing', () => {
        expect(
            buildManagerLessonVehiclesForSelect({
                vehicles: [vehicle],
                selectedVehicleId: 'vehicle-2',
                fallbackVehicle: { ...vehicle, id: 'vehicle-2' },
            }),
        ).toEqual([{ ...vehicle, id: 'vehicle-2' }, vehicle]);
    });
});
