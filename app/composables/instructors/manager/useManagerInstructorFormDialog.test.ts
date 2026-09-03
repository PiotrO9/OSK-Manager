import { describe, expect, it } from 'vitest';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import {
    getManagerInstructorDefaultSchoolId,
    isManagerInstructorFormUuid,
    validateManagerInstructorFormDraft,
} from './useManagerInstructorFormDialog';

const SCHOOL_ID = '123e4567-e89b-12d3-a456-426614174000';
const OTHER_SCHOOL_ID = '123e4567-e89b-12d3-a456-426614174001';

function makeSchool(id: string): DrivingSchool {
    return {
        id,
        name: `OSK ${id}`,
        city: 'Kraków',
    };
}

describe('useManagerInstructorFormDialog', () => {
    it('waliduje UUID szkoły', () => {
        expect(isManagerInstructorFormUuid(` ${SCHOOL_ID} `)).toBe(true);
        expect(isManagerInstructorFormUuid('school-1')).toBe(false);
        expect(isManagerInstructorFormUuid('')).toBe(false);
    });

    it('wybiera prefill schoolId tylko gdy istnieje na liście szkół', () => {
        const schools = [makeSchool(SCHOOL_ID), makeSchool(OTHER_SCHOOL_ID)];

        expect(
            getManagerInstructorDefaultSchoolId({
                prefillSchoolId: SCHOOL_ID,
                schools,
            }),
        ).toBe(SCHOOL_ID);

        expect(
            getManagerInstructorDefaultSchoolId({
                prefillSchoolId: '123e4567-e89b-12d3-a456-426614174999',
                schools,
            }),
        ).toBe('');
    });

    it('wybiera jedyną szkołę, gdy nie ma poprawnego prefill', () => {
        expect(
            getManagerInstructorDefaultSchoolId({
                prefillSchoolId: null,
                schools: [makeSchool(SCHOOL_ID)],
            }),
        ).toBe(SCHOOL_ID);
    });

    it('zwraca błędy walidacji dla pustego formularza', () => {
        const result = validateManagerInstructorFormDraft({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            licenseNumber: '',
            schoolId: '',
        });

        expect(result.payload).toBeNull();
        expect(result.validation).toMatchObject({
            showEmailRequired: true,
            showPasswordRequired: true,
            showFirstRequired: true,
            showLastRequired: true,
            showLicenseRequired: true,
            showSchoolRequired: true,
        });
    });

    it('rozróżnia niepoprawny email i zbyt krótkie hasło', () => {
        const result = validateManagerInstructorFormDraft({
            email: 'wrong',
            password: '12345',
            firstName: 'Jan',
            lastName: 'Nowak',
            licenseNumber: 'LIC-1',
            schoolId: SCHOOL_ID,
        });

        expect(result.payload).toBeNull();
        expect(result.validation.showEmailInvalid).toBe(true);
        expect(result.validation.showPasswordTooShort).toBe(true);
    });

    it('normalizuje poprawny payload submitu', () => {
        const result = validateManagerInstructorFormDraft({
            email: ' jan@example.com ',
            password: 'secret1',
            firstName: ' Jan ',
            lastName: ' Nowak ',
            licenseNumber: ' LIC-1 ',
            schoolId: ` ${SCHOOL_ID} `,
        });

        expect(result.validation).toEqual({
            showEmailRequired: false,
            showEmailInvalid: false,
            showPasswordRequired: false,
            showPasswordTooShort: false,
            showFirstRequired: false,
            showLastRequired: false,
            showLicenseRequired: false,
            showSchoolRequired: false,
        });
        expect(result.payload).toEqual({
            email: 'jan@example.com',
            password: 'secret1',
            firstName: 'Jan',
            lastName: 'Nowak',
            licenseNumber: 'LIC-1',
            schoolId: SCHOOL_ID,
        });
    });
});
