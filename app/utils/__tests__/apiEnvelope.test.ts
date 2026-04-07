import { describe, expect, it } from 'vitest';
import {
    assertBooleanSuccessEnvelope,
    getApiErrorStatusCode,
    unwrapApiSuccessData,
} from '../apiEnvelope';

describe('unwrapApiSuccessData', () => {
    it('returns data when success true', () => {
        expect(unwrapApiSuccessData({ success: true, data: { a: 1 } })).toEqual(
            { a: 1 },
        );
    });

    it('throws on success false with error', () => {
        expect(() =>
            unwrapApiSuccessData({ success: false, error: 'x' }),
        ).toThrow('x');
    });
});

describe('assertBooleanSuccessEnvelope', () => {
    it('does not throw on success true', () => {
        expect(() =>
            assertBooleanSuccessEnvelope({ success: true }),
        ).not.toThrow();
    });

    it('throws server error message', () => {
        expect(() =>
            assertBooleanSuccessEnvelope({
                success: false,
                error: 'not allowed',
            }),
        ).toThrow('not allowed');
    });

    it('throws on invalid body', () => {
        expect(() => assertBooleanSuccessEnvelope(null)).toThrow(
            'Nieprawidłowa odpowiedź serwera.',
        );
    });

    it('throws when success missing', () => {
        expect(() => assertBooleanSuccessEnvelope({})).toThrow(
            'Nieprawidłowa odpowiedź serwera.',
        );
    });
});

describe('getApiErrorStatusCode', () => {
    it('returns undefined for primitives', () => {
        expect(getApiErrorStatusCode(null)).toBeUndefined();
        expect(getApiErrorStatusCode('x')).toBeUndefined();
    });

    it('returns numeric statusCode', () => {
        expect(getApiErrorStatusCode({ statusCode: 404 })).toBe(404);
    });

    it('returns undefined when not number', () => {
        expect(getApiErrorStatusCode({ statusCode: '404' })).toBeUndefined();
    });
});
