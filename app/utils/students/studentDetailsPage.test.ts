import { describe, expect, it } from 'vitest';
import {
    getStudentCountOverviewLabel,
    getStudentDetailsDisplayName,
    getStudentDetailsInitials,
    getStudentDetailsRouteUserIdString,
    getStudentDetailsSubtitle,
    getStudentNotesOverviewLabel,
    getStudentProcessOverviewLabel,
} from './studentDetailsPage';

const student = {
    id: 'student-profile-1',
    userId: 'student-user-1',
    firstName: ' Anna ',
    lastName: ' Nowak ',
    email: 'anna@example.com',
    pkkNumber: null,
    notes: ' Ważna notatka ',
    courses: [
        {
            id: 'course-1',
            name: 'Kurs B',
            category: ' B ',
            status: 'ACTIVE',
        },
    ],
};

describe('student details page helpers', () => {
    it('normalizes route user id values', () => {
        expect(getStudentDetailsRouteUserIdString(' user-1 ')).toBe('user-1');
        expect(getStudentDetailsRouteUserIdString([' user-2 ', 'x'])).toBe(
            'user-2',
        );
        expect(getStudentDetailsRouteUserIdString(undefined)).toBe('');
    });

    it('builds profile view model labels', () => {
        expect(getStudentDetailsDisplayName(student)).toBe('Anna Nowak');
        expect(getStudentDetailsInitials(student)).toBe('AN');
        expect(getStudentDetailsSubtitle(student)).toBe('Kursant - Kat. B');
        expect(getStudentNotesOverviewLabel(student)).toBe('Dodano');
    });

    it('builds overview labels from loading, error and count states', () => {
        expect(
            getStudentProcessOverviewLabel({
                isLoading: true,
                hasError: false,
                total: 2,
                completed: 1,
            }),
        ).toBe('Wczytywanie');
        expect(
            getStudentProcessOverviewLabel({
                isLoading: false,
                hasError: false,
                total: 2,
                completed: 1,
            }),
        ).toBe('1/2');
        expect(
            getStudentCountOverviewLabel({
                isLoading: false,
                hasError: true,
                count: 3,
            }),
        ).toBe('Błąd');
        expect(
            getStudentCountOverviewLabel({
                isLoading: false,
                hasError: false,
                count: 3,
            }),
        ).toBe('3');
    });
});
