import { describe, expect, it } from 'vitest';
import { stripInstructorPatchBody } from './parseInstructorPatchBody';

const COURSE_TYPE_A = '11111111-1111-4111-8111-111111111111';
const COURSE_TYPE_B = '22222222-2222-4222-8222-222222222222';

describe('stripInstructorPatchBody', () => {
    it('returns an empty patch for non-object body', () => {
        expect(stripInstructorPatchBody(null)).toEqual({});
        expect(stripInstructorPatchBody('unexpected')).toEqual({});
    });

    it('keeps only supported instructor patch fields', () => {
        expect(
            stripInstructorPatchBody({
                firstName: ' Anna ',
                lastName: null,
                qualifications: null,
                experienceYears: 8,
                qualifiedCourseTypeIds: [
                    ` ${COURSE_TYPE_A} `,
                    COURSE_TYPE_A,
                    COURSE_TYPE_B,
                ],
                ignored: true,
            }),
        ).toEqual({
            firstName: ' Anna ',
            lastName: '',
            qualifications: '',
            experienceYears: 8,
            qualifiedCourseTypeIds: [COURSE_TYPE_A, COURSE_TYPE_B],
        });
    });

    it('throws for invalid qualified course type ids', () => {
        expect(() =>
            stripInstructorPatchBody({ qualifiedCourseTypeIds: 'bad' }),
        ).toThrow('Invalid qualifiedCourseTypeIds');
        expect(() =>
            stripInstructorPatchBody({ qualifiedCourseTypeIds: ['bad-id'] }),
        ).toThrow('Invalid qualifiedCourseTypeIds');
    });
});
