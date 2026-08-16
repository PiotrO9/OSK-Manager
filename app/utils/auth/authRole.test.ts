import { describe, expect, it } from 'vitest';
import {
    canAccessRole,
    hasManagerAccess,
    hasManagerOrInstructorAccess,
    hasStudentOrInstructorAccess,
    isAuthRole,
    normalizeAuthRole,
} from './authRole';

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

describe('auth role access groups', () => {
    it('treats ADMIN as manager access', () => {
        expect(hasManagerAccess('ADMIN')).toBe(true);
        expect(hasManagerAccess('manager')).toBe(true);
        expect(hasManagerAccess('INSTRUCTOR')).toBe(false);
    });

    it('checks manager or instructor access', () => {
        expect(hasManagerOrInstructorAccess('admin')).toBe(true);
        expect(hasManagerOrInstructorAccess('manager')).toBe(true);
        expect(hasManagerOrInstructorAccess(' instructor ')).toBe(true);
        expect(hasManagerOrInstructorAccess('student')).toBe(false);
    });

    it('checks student or instructor access', () => {
        expect(hasStudentOrInstructorAccess('student')).toBe(true);
        expect(hasStudentOrInstructorAccess('instructor')).toBe(true);
        expect(hasStudentOrInstructorAccess('manager')).toBe(false);
    });

    it('checks custom allowed roles', () => {
        expect(canAccessRole('demo', ['DEMO'])).toBe(true);
        expect(canAccessRole('demo', ['STUDENT'])).toBe(false);
        expect(canAccessRole('owner', ['ADMIN'])).toBe(false);
    });
});
