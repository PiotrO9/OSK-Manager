import { describe, expect, it } from 'vitest';
import type { CourseDetail } from '~/types/courses/course';

import {
    buildCourseOverviewItems,
    buildCourseRelatedItems,
    formatCapacityText,
    formatCourseInstructorName,
    getRouteIdString,
    readSchoolIdFromQuery,
    resolveCourseDetailError,
} from './managerCourseDetailPage';

function course(overrides: Partial<CourseDetail> = {}): CourseDetail {
    return {
        id: 'course-1',
        name: 'Kurs B',
        category: 'B',
        courseType: { id: 'type-b', code: 'B', name: 'Kategoria B' },
        type: 'PRACTICAL',
        totalHours: 30,
        instructor: null,
        capacity: null,
        schoolId: 'school-1',
        ...overrides,
    };
}

describe('managerCourseDetailPage utils', () => {
    it('normalizes route id params', () => {
        expect(getRouteIdString(' course-1 ')).toBe('course-1');
        expect(getRouteIdString([' course-2 ', 'ignored'])).toBe('course-2');
        expect(getRouteIdString([])).toBe('');
        expect(getRouteIdString(null)).toBe('');
    });

    it('reads school id from query values', () => {
        expect(readSchoolIdFromQuery(' school-1 ')).toBe('school-1');
        expect(readSchoolIdFromQuery([' school-2 ', 'ignored'])).toBe(
            'school-2',
        );
        expect(readSchoolIdFromQuery(undefined)).toBe('');
        expect(readSchoolIdFromQuery(null)).toBe('');
    });

    it('maps course detail API errors to user messages', () => {
        expect(resolveCourseDetailError({ statusCode: 403 })).toBe(
            'Brak dost�pu do szczeg��w tego kursu.',
        );
        expect(resolveCourseDetailError({ statusCode: 404 })).toBe(
            'Nie znaleziono kursu.',
        );
        expect(resolveCourseDetailError({ statusCode: 500 })).toBe(
            'Serwer jest chwilowo niedost�pny. Spr�buj ponownie.',
        );
        expect(resolveCourseDetailError(new Error('API down'))).toBe(
            'API down',
        );
    });

    it('formats capacity and instructor labels', () => {
        expect(formatCapacityText(null)).toBe('Brak limitu');
        expect(formatCapacityText(12)).toBe('12');
        expect(formatCourseInstructorName(course())).toBe('Brak instruktora');
        expect(
            formatCourseInstructorName(
                course({
                    instructor: { id: 'instructor-1', name: ' Anna Nowak ' },
                }),
            ),
        ).toBe('Anna Nowak');
    });

    it('builds overview items for course cards', () => {
        expect(
            buildCourseOverviewItems(course({ capacity: 12, totalHours: 40 })),
        ).toEqual([
            {
                label: 'Godziny kursu',
                description: '40 h lacznie',
                badge: '40 h',
                tone: 'info',
            },
            {
                label: 'Typ kursu',
                description: 'Rodzaj zajec i organizacji kursu.',
                badge: 'Praktyka',
                tone: 'neutral',
            },
            {
                label: 'Limit miejsc',
                description: 'Maksymalna liczba uczestnikow.',
                badge: '12',
                tone: 'success',
            },
        ]);
    });

    it('builds related items for course cards', () => {
        expect(
            buildCourseRelatedItems({
                course: course({
                    instructor: { id: 'instructor-1', name: 'Anna Nowak' },
                }),
                courseCategoryLabel: 'Kategoria B',
                effectiveSchoolId: 'school-1',
            }),
        ).toEqual([
            {
                label: 'Instruktor',
                description: 'Przypisanie edytowane w panelu obok.',
                badge: 'Anna Nowak',
            },
            {
                label: 'Kategoria',
                description: 'Zachowana w konfiguracji kursu.',
                badge: 'Kategoria B',
            },
            {
                label: 'OSK',
                description: 'Kontekst pobrany z linku lub danych kursu.',
                badge: 'Powiazane',
            },
        ]);
    });
});
