import { describe, expect, it } from 'vitest';
import { parseCourseCreateBody } from './parseCourseCreateBody';
import { parseCoursePatchInstructorBody } from './parseCoursePatchBody';

const SCHOOL_ID = '11111111-1111-4111-8111-111111111111';
const INSTRUCTOR_ID = '22222222-2222-4222-8222-222222222222';

describe('course body parsers', () => {
    it('parses a valid theory course create body', () => {
        expect(
            parseCourseCreateBody({
                schoolId: SCHOOL_ID,
                name: ' Kurs B ',
                category: ' B ',
                kind: 'THEORY_GROUP',
                totalHours: '30',
                theoryStartDate: '2026-09-01',
                theoryEndDate: '2026-09-14',
                capacity: '12',
                instructorId: INSTRUCTOR_ID,
            }),
        ).toEqual({
            bffBody: {
                schoolId: SCHOOL_ID,
                name: 'Kurs B',
                category: 'B',
                kind: 'THEORY_GROUP',
                totalHours: 30,
                theoryStartDate: '2026-09-01',
                theoryEndDate: '2026-09-14',
                capacity: 12,
                instructorId: INSTRUCTOR_ID,
            },
        });
    });

    it('keeps existing create validation errors', () => {
        expect(parseCourseCreateBody(null)).toEqual({
            error: 'Pole schoolId jest wymagane i musi być poprawnym identyfikatorem UUID.',
        });

        expect(parseCourseCreateBody({ schoolId: SCHOOL_ID })).toEqual({
            error: 'Pole name jest wymagane.',
        });

        expect(
            parseCourseCreateBody({
                schoolId: SCHOOL_ID,
                name: 'Kurs B',
                category: '',
                kind: 'THEORY_GROUP',
                totalHours: 30,
            }),
        ).toEqual({
            error: 'Pole category jest wymagane.',
        });

        expect(
            parseCourseCreateBody({
                schoolId: SCHOOL_ID,
                name: 'Kurs B',
                category: 'B',
                kind: 'PRACTICAL',
                totalHours: 0,
            }),
        ).toEqual({
            error: 'Pole totalHours jest wymagane i musi być liczbą całkowitą co najmniej 1.',
        });

        expect(
            parseCourseCreateBody({
                schoolId: SCHOOL_ID,
                name: 'Kurs B',
                category: 'B',
                kind: 'PRACTICAL',
                totalHours: 30,
                capacity: 4,
            }),
        ).toEqual({
            error: 'Pole capacity jest dozwolone tylko dla kursu typu THEORY_GROUP.',
        });
    });

    it('parses patch instructor body without changing no-op and null handling', () => {
        expect(parseCoursePatchInstructorBody({})).toEqual({ record: {} });
        expect(parseCoursePatchInstructorBody({ instructorId: '' })).toEqual({
            record: { instructorId: null },
        });
        expect(parseCoursePatchInstructorBody({ instructorId: null })).toEqual({
            record: { instructorId: null },
        });
        expect(
            parseCoursePatchInstructorBody({ instructorId: INSTRUCTOR_ID }),
        ).toEqual({
            record: { instructorId: INSTRUCTOR_ID },
        });
    });

    it('keeps existing patch validation errors', () => {
        expect(parseCoursePatchInstructorBody(null)).toEqual({
            error: 'Nieprawidłowe dane żądania.',
        });
        expect(parseCoursePatchInstructorBody('unexpected')).toEqual({
            error: 'Nieprawidłowe dane żądania.',
        });
        expect(
            parseCoursePatchInstructorBody({ instructorId: 'bad-id' }),
        ).toEqual({
            error: 'Pole instructorId musi być poprawnym identyfikatorem UUID lub null.',
        });
    });
});
