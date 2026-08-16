import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    parseScheduleManagerQuery,
    parseScheduleMeQuery,
} from './scheduleQueryValidation';

const INSTRUCTOR_ID = '11111111-1111-4111-8111-111111111111';
const STUDENT_ID = '22222222-2222-4222-8222-222222222222';
const SCHOOL_ID = '33333333-3333-4333-8333-333333333333';

function installCreateErrorGlobal(): void {
    vi.stubGlobal(
        'createError',
        (input: { statusCode: number; message: string }) => {
            const error = new Error(input.message) as Error & {
                statusCode: number;
            };

            error.statusCode = input.statusCode;

            return error;
        },
    );
}

describe('schedule query validation', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        installCreateErrorGlobal();
    });

    it('parses schedule date range query after trimming', () => {
        expect(
            parseScheduleMeQuery({
                dateFrom: ' 2026-08-10 ',
                dateTo: ' 2026-08-16 ',
            }),
        ).toEqual({
            dateFrom: '2026-08-10',
            dateTo: '2026-08-16',
        });
    });

    it('rejects invalid or reversed schedule date ranges', () => {
        expect(() => parseScheduleMeQuery({ dateTo: '2026-08-16' })).toThrow(
            'Parametr dateFrom jest wymagany (YYYY-MM-DD).',
        );
        expect(() =>
            parseScheduleMeQuery({
                dateFrom: '2026-08-17',
                dateTo: '2026-08-16',
            }),
        ).toThrow('dateFrom nie może być późniejsze niż dateTo.');
    });

    it('parses manager instructor and student schedule targets', () => {
        expect(
            parseScheduleManagerQuery({
                dateFrom: '2026-08-10',
                dateTo: '2026-08-16',
                instructorId: ` ${INSTRUCTOR_ID} `,
            }),
        ).toEqual({
            dateFrom: '2026-08-10',
            dateTo: '2026-08-16',
            instructorId: INSTRUCTOR_ID,
        });

        expect(
            parseScheduleManagerQuery({
                dateFrom: '2026-08-10',
                dateTo: '2026-08-16',
                studentId: ` ${STUDENT_ID} `,
                schoolId: ` ${SCHOOL_ID} `,
            }),
        ).toEqual({
            dateFrom: '2026-08-10',
            dateTo: '2026-08-16',
            studentId: STUDENT_ID,
            schoolId: SCHOOL_ID,
        });
    });

    it('requires exactly one schedule target and school id for student target', () => {
        expect(() =>
            parseScheduleManagerQuery({
                dateFrom: '2026-08-10',
                dateTo: '2026-08-16',
            }),
        ).toThrow(
            'Podaj dokładnie jeden parametr: instructorId albo studentId.',
        );

        expect(() =>
            parseScheduleManagerQuery({
                dateFrom: '2026-08-10',
                dateTo: '2026-08-16',
                instructorId: INSTRUCTOR_ID,
                studentId: STUDENT_ID,
            }),
        ).toThrow(
            'Podaj dokładnie jeden parametr: instructorId albo studentId.',
        );

        expect(() =>
            parseScheduleManagerQuery({
                dateFrom: '2026-08-10',
                dateTo: '2026-08-16',
                studentId: STUDENT_ID,
            }),
        ).toThrow(
            'Parametr schoolId jest wymagany przy pobieraniu terminarza kursanta.',
        );
    });
});
