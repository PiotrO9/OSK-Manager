import { describe, expect, it } from 'vitest';
import type { InstructorListItem } from '~/types/instructors/instructor';
import {
    buildInstructorDetailsRoute,
    formatQualificationFilterLabel,
    formatVisibleInstructorsLabel,
    instructorInitials,
    instructorQualificationLabel,
    isInstructorSchoolIdUuid,
    resolveInstructorRegisterError,
    resolveInstructorsListError,
} from '~/utils/instructors/managerInstructorsPage';

function instructor(
    overrides: Partial<InstructorListItem> = {},
): InstructorListItem {
    return {
        id: 'instructor-1',
        firstName: 'Anna',
        lastName: 'Nowak',
        email: 'anna@example.com',
        phone: null,
        qualifiedCourseTypes: [],
        ...overrides,
    };
}

describe('managerInstructorsPage utils', () => {
    it('validates UUID route query values', () => {
        expect(
            isInstructorSchoolIdUuid('123e4567-e89b-12d3-a456-426614174000'),
        ).toBe(true);
        expect(
            isInstructorSchoolIdUuid(' 123e4567-e89b-12d3-a456-426614174000 '),
        ).toBe(true);
        expect(isInstructorSchoolIdUuid('school-1')).toBe(false);
        expect(isInstructorSchoolIdUuid('')).toBe(false);
    });

    it('maps instructor register errors', () => {
        expect(resolveInstructorRegisterError({ statusCode: 403 })).toBe(
            'Brak uprawnień do tej operacji.',
        );
        expect(resolveInstructorRegisterError({ statusCode: 500 })).toBe(
            'Serwer jest chwilowo niedostępny. Spróbuj ponownie.',
        );
        expect(
            resolveInstructorRegisterError({
                statusCode: 409,
                data: { message: 'Email jest zajęty.' },
            }),
        ).toBe('Email jest zajęty.');
        expect(resolveInstructorRegisterError(new Error('Boom'))).toBe('Boom');
    });

    it('maps instructors list errors', () => {
        expect(resolveInstructorsListError({ statusCode: 403 })).toBe(
            'Brak dostępu do listy instruktorów dla wybranej szkoły.',
        );
        expect(resolveInstructorsListError({ statusCode: 503 })).toBe(
            'Serwer jest chwilowo niedostępny. Spróbuj ponownie.',
        );
        expect(resolveInstructorsListError(new Error('Network down'))).toBe(
            'Network down',
        );
        expect(resolveInstructorsListError({})).toBe(
            'Nie udało się pobrać listy instruktorów.',
        );
    });

    it('formats visible instructors count label', () => {
        expect(formatVisibleInstructorsLabel(0)).toBe('0 wyników');
        expect(formatVisibleInstructorsLabel(1)).toBe('1 wynik');
        expect(formatVisibleInstructorsLabel(2)).toBe('2 wyniki');
        expect(formatVisibleInstructorsLabel(4)).toBe('4 wyniki');
        expect(formatVisibleInstructorsLabel(5)).toBe('5 wyników');
    });

    it('formats qualification filter label', () => {
        expect(formatQualificationFilterLabel(0)).toBe(
            'Kwalifikacje: brak danych',
        );
        expect(formatQualificationFilterLabel(1)).toBe(
            'Kwalifikacje: wszystkie',
        );
    });

    it('formats instructor qualification labels', () => {
        expect(instructorQualificationLabel(instructor())).toBe(
            'Brak kwalifikacji',
        );
        expect(
            instructorQualificationLabel(
                instructor({
                    qualifiedCourseTypes: [
                        { id: 'ct-1', code: 'B', name: 'Prawo jazdy B' },
                        { id: 'ct-2', code: '', name: 'Motocykl' },
                    ],
                }),
            ),
        ).toBe('B, Motocykl');
    });

    it('formats instructor initials with fallback', () => {
        expect(instructorInitials(instructor())).toBe('AN');
        expect(
            instructorInitials(instructor({ firstName: '', lastName: '' })),
        ).toBe('IN');
    });

    it('builds instructor details route with optional school query', () => {
        expect(buildInstructorDetailsRoute(instructor(), '')).toEqual({
            path: '/manager/instructors/instructor-1',
            query: {},
        });
        expect(buildInstructorDetailsRoute(instructor(), ' school-1 ')).toEqual(
            {
                path: '/manager/instructors/instructor-1',
                query: { schoolId: 'school-1' },
            },
        );
    });
});
