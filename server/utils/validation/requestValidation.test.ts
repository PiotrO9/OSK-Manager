import { describe, expect, it } from 'vitest';
import type { H3Event } from 'h3';
import {
    isUuid,
    parseSchoolIdFromBody,
    parsePositiveIntQuery,
    parseRequiredRouterParam,
    parseRequiredUuidRouterParam,
    parseRequiredUuidQuery,
    readQueryString,
    readOptionalDateString,
    readOptionalUuid,
    readTrimmedBodyString,
} from './requestValidation';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

function mockEvent(params: Record<string, string | undefined>): H3Event {
    return {
        context: {
            params,
        },
    } as unknown as H3Event;
}

describe('requestValidation', () => {
    it('validates UUID strings after trimming whitespace', () => {
        expect(isUuid(` ${VALID_UUID} `)).toBe(true);
        expect(isUuid('not-a-uuid')).toBe(false);
    });

    it('reads trimmed body strings from strings, numbers, and nullish values', () => {
        expect(readTrimmedBodyString({ name: '  Kurs B  ' }, 'name')).toBe(
            'Kurs B',
        );
        expect(readTrimmedBodyString({ totalHours: 30 }, 'totalHours')).toBe(
            '30',
        );
        expect(readTrimmedBodyString({ name: null }, 'name')).toBe('');
        expect(readTrimmedBodyString({}, 'missing')).toBe('');
    });

    it('reads query strings from scalar and array query values', () => {
        expect(readQueryString('  abc  ')).toBe('abc');
        expect(readQueryString([' first ', 'second'])).toBe('first');
        expect(readQueryString(undefined)).toBe('');
    });

    it('parses required UUID query parameters with caller-provided errors', () => {
        expect(
            parseRequiredUuidQuery(
                { schoolId: ` ${VALID_UUID} ` },
                'schoolId',
                {
                    required: 'schoolId required',
                    invalid: 'schoolId invalid',
                },
            ),
        ).toBe(VALID_UUID);

        expect(() =>
            parseRequiredUuidQuery({}, 'schoolId', {
                required: 'schoolId required',
                invalid: 'schoolId invalid',
            }),
        ).toThrow('schoolId required');

        expect(() =>
            parseRequiredUuidQuery({ schoolId: 'bad-id' }, 'schoolId', {
                required: 'schoolId required',
                invalid: 'schoolId invalid',
            }),
        ).toThrow('schoolId invalid');
    });

    it('parses required UUID route parameters with caller-provided errors', () => {
        expect(
            parseRequiredUuidRouterParam(
                mockEvent({ id: ` ${VALID_UUID} ` }),
                'id',
                {
                    required: 'id required',
                    invalid: 'id invalid',
                },
            ),
        ).toBe(VALID_UUID);

        expect(() =>
            parseRequiredUuidRouterParam(mockEvent({}), 'id', {
                required: 'id required',
                invalid: 'id invalid',
            }),
        ).toThrow('id required');

        expect(() =>
            parseRequiredUuidRouterParam(mockEvent({ id: 'bad-id' }), 'id', {
                required: 'id required',
                invalid: 'id invalid',
            }),
        ).toThrow('id invalid');
    });

    it('parses required route parameters without applying UUID validation', () => {
        expect(
            parseRequiredRouterParam(
                mockEvent({ id: ' vehicle-1 ' }),
                'id',
                'id required',
            ),
        ).toBe('vehicle-1');

        expect(() =>
            parseRequiredRouterParam(mockEvent({}), 'id', 'id required'),
        ).toThrow('id required');
    });

    it('parses positive int query values with fallback left to the caller', () => {
        expect(parsePositiveIntQuery(' 12 ', 1)).toBe(12);
        expect(parsePositiveIntQuery(9.9, 1)).toBe(9);
        expect(parsePositiveIntQuery('abc', 20)).toBe(20);
        expect(parsePositiveIntQuery(undefined, 20)).toBe(20);
    });

    it('parses schoolId only when body contains a valid UUID', () => {
        expect(parseSchoolIdFromBody({ schoolId: ` ${VALID_UUID} ` })).toBe(
            VALID_UUID,
        );
        expect(parseSchoolIdFromBody({ schoolId: 'bad-id' })).toBeNull();
        expect(parseSchoolIdFromBody(null)).toBeNull();
    });

    it('keeps optional UUID state explicit', () => {
        expect(readOptionalUuid({}, 'instructorId')).toEqual({
            status: 'omit',
        });
        expect(
            readOptionalUuid({ instructorId: null }, 'instructorId'),
        ).toEqual({ status: 'null' });
        expect(readOptionalUuid({ instructorId: '' }, 'instructorId')).toEqual({
            status: 'null',
        });
        expect(
            readOptionalUuid({ instructorId: VALID_UUID }, 'instructorId'),
        ).toEqual({ status: 'value', uuid: VALID_UUID });
        expect(
            readOptionalUuid({ instructorId: 'bad-id' }, 'instructorId'),
        ).toEqual({ status: 'invalid' });
    });

    it('reads optional date strings without validating date semantics', () => {
        expect(readOptionalDateString({}, 'theoryStartDate')).toBeUndefined();
        expect(
            readOptionalDateString(
                { theoryStartDate: null },
                'theoryStartDate',
            ),
        ).toBeNull();
        expect(
            readOptionalDateString(
                { theoryStartDate: ' 2026-06-25 ' },
                'theoryStartDate',
            ),
        ).toBe('2026-06-25');
    });
});
