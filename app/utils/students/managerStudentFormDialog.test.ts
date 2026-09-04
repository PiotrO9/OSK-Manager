import { describe, expect, it } from 'vitest';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import {
    buildStudentRegisterPayload,
    getEmptyStudentFormValidationState,
    hasStudentFormValidationErrors,
    isStudentFormUuid,
    resolveDefaultStudentSchoolId,
    validateStudentFormDraft,
} from './managerStudentFormDialog';

const SCHOOL_ID = '123e4567-e89b-12d3-a456-426614174000';
const OTHER_SCHOOL_ID = '223e4567-e89b-12d3-a456-426614174001';

const school = (overrides: Partial<DrivingSchool> = {}): DrivingSchool => ({
    id: SCHOOL_ID,
    name: 'OSK Test',
    city: 'Warszawa',
    ...overrides,
});

describe('manager student form dialog utilities', () => {
    it('validates UUID values used by school selection', () => {
        expect(isStudentFormUuid(SCHOOL_ID)).toBe(true);
        expect(isStudentFormUuid(` ${SCHOOL_ID} `)).toBe(true);
        expect(isStudentFormUuid('not-a-uuid')).toBe(false);
    });

    it('resolves the default school from valid prefill or a single school', () => {
        expect(resolveDefaultStudentSchoolId([school()], SCHOOL_ID)).toBe(
            SCHOOL_ID,
        );
        expect(resolveDefaultStudentSchoolId([school()], OTHER_SCHOOL_ID)).toBe(
            SCHOOL_ID,
        );
        expect(
            resolveDefaultStudentSchoolId(
                [school(), school({ id: OTHER_SCHOOL_ID })],
                OTHER_SCHOOL_ID,
            ),
        ).toBe(OTHER_SCHOOL_ID);
        expect(
            resolveDefaultStudentSchoolId(
                [school(), school({ id: OTHER_SCHOOL_ID })],
                'invalid',
            ),
        ).toBe('');
    });

    it('returns a clean validation state for a complete draft', () => {
        const validation = validateStudentFormDraft({
            email: ' user@example.com ',
            password: 'secret1',
            firstName: ' Anna ',
            lastName: ' Nowak ',
            schoolId: SCHOOL_ID,
        });

        expect(validation).toEqual(getEmptyStudentFormValidationState());
        expect(hasStudentFormValidationErrors(validation)).toBe(false);
    });

    it('marks required and format validation errors', () => {
        expect(
            validateStudentFormDraft({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                schoolId: '',
            }),
        ).toEqual({
            showEmailRequired: true,
            showEmailInvalid: false,
            showPasswordRequired: true,
            showPasswordTooShort: false,
            showFirstRequired: true,
            showLastRequired: true,
            showSchoolRequired: true,
        });

        expect(
            validateStudentFormDraft({
                email: 'invalid',
                password: '12345',
                firstName: 'Anna',
                lastName: 'Nowak',
                schoolId: 'invalid',
            }),
        ).toMatchObject({
            showEmailInvalid: true,
            showPasswordTooShort: true,
            showSchoolRequired: true,
        });
    });

    it('builds a trimmed registration payload without trimming password', () => {
        expect(
            buildStudentRegisterPayload({
                email: ' user@example.com ',
                password: ' secret ',
                firstName: ' Anna ',
                lastName: ' Nowak ',
                schoolId: ` ${SCHOOL_ID} `,
            }),
        ).toEqual({
            email: 'user@example.com',
            password: ' secret ',
            firstName: 'Anna',
            lastName: 'Nowak',
            schoolId: SCHOOL_ID,
        });
    });
});
