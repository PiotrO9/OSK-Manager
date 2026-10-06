import { describe, expect, it } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import {
    getManagerInstructorDefaultSchoolId,
    isManagerInstructorFormUuid,
    validateManagerInstructorFormDraft,
    useManagerInstructorForm,
} from './useManagerInstructorForm';

const SCHOOL_ID = '123e4567-e89b-12d3-a456-426614174000';
const OTHER_SCHOOL_ID = '123e4567-e89b-12d3-a456-426614174001';

function makeSchool(id: string): DrivingSchool {
    return {
        id,
        name: `OSK ${id}`,
        city: 'Kraków',
    };
}

describe('useManagerInstructorForm', () => {
    it('waliduje UUID szkoły', () => {
        expect(isManagerInstructorFormUuid(` ${SCHOOL_ID} `)).toBe(true);
        expect(isManagerInstructorFormUuid('school-1')).toBe(false);
        expect(isManagerInstructorFormUuid('')).toBe(false);
    });

    it('wybiera aktywną szkołę tylko gdy istnieje na liście szkół', () => {
        const schools = [makeSchool(SCHOOL_ID), makeSchool(OTHER_SCHOOL_ID)];

        expect(
            getManagerInstructorDefaultSchoolId({
                selectedSchoolId: SCHOOL_ID,
                schools,
            }),
        ).toBe(SCHOOL_ID);

        expect(
            getManagerInstructorDefaultSchoolId({
                selectedSchoolId: '123e4567-e89b-12d3-a456-426614174999',
                schools,
            }),
        ).toBe('');
    });

    it('wybiera jedyną szkołę, gdy nie ma aktywnej szkoły na liście', () => {
        expect(
            getManagerInstructorDefaultSchoolId({
                selectedSchoolId: null,
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
            birthDate: '',
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
            birthDate: '2000-02-29',
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
            birthDate: '2000-02-29',
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
            showBirthDateRequired: false,
            showBirthDateInvalid: false,
            showBirthDateFuture: false,
        });
        expect(result.payload).toEqual({
            email: 'jan@example.com',
            password: 'secret1',
            firstName: 'Jan',
            lastName: 'Nowak',
            licenseNumber: 'LIC-1',
            schoolId: SCHOOL_ID,
            birthDate: '2000-02-29',
        });
    });

    it.each(['2001-02-29', '2026-02-30', '0000-01-01', '2000-01-01T00:00:00Z'])(
        'rejects invalid date %s',
        (birthDate) => {
            const result = validateManagerInstructorFormDraft({
                email: 'jan@example.com',
                password: 'secret1',
                firstName: 'Jan',
                lastName: 'Nowak',
                licenseNumber: 'LIC-1',
                schoolId: SCHOOL_ID,
                birthDate,
            });

            expect(result.errors.birthDate).toBe(
                'Podaj poprawną datę urodzenia.',
            );
        },
    );

    it('validates future dates against the supplied Warsaw day', () => {
        const result = validateManagerInstructorFormDraft(
            {
                email: 'jan@example.com',
                password: 'secret1',
                firstName: 'Jan',
                lastName: 'Nowak',
                licenseNumber: 'LIC-1',
                schoolId: SCHOOL_ID,
                birthDate: '2026-10-06',
            },
            '2026-10-05',
        );

        expect(result.validation.showBirthDateFuture).toBe(true);
    });

    it('shows only touched errors, clears corrected values and tracks the initialized school baseline', async () => {
        const scope = effectScope();
        const loading = ref(true);
        const schools = ref<DrivingSchool[]>([]);
        const form = scope.run(() =>
            useManagerInstructorForm({
                schools,
                isSchoolsLoading: loading,
                selectedSchoolId: ref(SCHOOL_ID),
            }),
        )!;

        try {
            schools.value = [makeSchool(SCHOOL_ID)];
            loading.value = false;
            await nextTick();
            expect(form.schoolIdModel.value).toBe(SCHOOL_ID);
            expect(form.isDirty.value).toBe(false);
            expect(form.fieldErrors.value).toEqual({});
            form.touchField('email');
            expect(form.fieldErrors.value).toEqual({
                email: 'E-mail jest wymagany.',
            });
            form.emailModel.value = 'jan@example.com';
            expect(form.fieldErrors.value).toEqual({});
            expect(form.isDirty.value).toBe(true);
            form.emailModel.value = '';
            expect(form.isDirty.value).toBe(false);
            form.validateForSubmit();
            expect(form.fieldErrors.value.birthDate).toBe(
                'Data urodzenia jest wymagana.',
            );
            form.firstNameModel.value = 'Jan';
            loading.value = true;
            await nextTick();
            loading.value = false;
            await nextTick();
            expect(form.firstNameModel.value).toBe('Jan');
            expect(form.isDirty.value).toBe(true);
        } finally {
            scope.stop();
        }
    });
});
