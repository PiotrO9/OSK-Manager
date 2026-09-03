import { describe, expect, it } from 'vitest';
import {
    buildManagerLessonInstructorsForSelect,
    buildManagerLessonVehiclesForSelect,
    parseInstructorListItemFromApi,
} from './useManagerLessonEditReferences';
import type { InstructorListItem } from '~/types/instructors/instructor';
import type { Vehicle } from '~/types/vehicles/vehicle';

const instructor: InstructorListItem = {
    id: 'instructor-1',
    firstName: 'Jan',
    lastName: 'Kowalski',
    email: 'jan@example.test',
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
