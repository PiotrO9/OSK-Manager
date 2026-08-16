import { describe, expect, it } from 'vitest';
import { isAuthRole, normalizeAuthRole } from './authRole';

describe('normalizeAuthRole', () => {
    it('normalizes known auth roles', () => {
        expect(normalizeAuthRole(' manager ')).toBe('MANAGER');
        expect(normalizeAuthRole('admin')).toBe('ADMIN');
        expect(normalizeAuthRole('INSTRUCTOR')).toBe('INSTRUCTOR');
        expect(normalizeAuthRole('student')).toBe('STUDENT');
        expect(normalizeAuthRole(' demo ')).toBe('DEMO');
    });

    it('rejects missing or unknown roles', () => {
        expect(normalizeAuthRole(null)).toBeNull();
        expect(normalizeAuthRole(undefined)).toBeNull();
        expect(normalizeAuthRole('')).toBeNull();
        expect(normalizeAuthRole('OWNER')).toBeNull();
        expect(normalizeAuthRole(123)).toBeNull();
    });
});

describe('isAuthRole', () => {
    it('checks a normalized role against a concrete role', () => {
        expect(isAuthRole(' student ', 'STUDENT')).toBe(true);
        expect(isAuthRole(' student ', 'MANAGER')).toBe(false);
    });
});
