import { describe, expect, it } from 'vitest';
import type { CourseDetail } from '~/types/courses/course';

import {
    buildCourseCapacityInsight,
    buildCourseOverviewItems,
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
            'Brak dostępu do szczegółów tego kursu.',
        );
        expect(resolveCourseDetailError({ statusCode: 404 })).toBe(
            'Nie znaleziono kursu.',
        );
        expect(resolveCourseDetailError({ statusCode: 500 })).toBe(
            'Serwer jest chwilowo niedostępny. Spróbuj ponownie.',
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
                    instructor: {
                        id: 'instructor-1',
                        name: ' Anna Nowak ',
                        avatarUrl: null,
                    },
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
                description: '40 h łącznie',
                badge: '40 h',
                tone: 'info',
            },
            {
                label: 'Typ kursu',
                description: 'Rodzaj zajęć i organizacji kursu.',
                badge: 'Praktyka',
                tone: 'neutral',
            },
            {
                label: 'Limit miejsc',
                description: 'Maksymalna liczba uczestników.',
                badge: '12',
                tone: 'success',
            },
        ]);
    });

    it('builds capacity insights for limited courses', () => {
        expect(
            buildCourseCapacityInsight({
                course: course({ capacity: 12 }),
                participantCount: 8,
            }),
        ).toEqual({
            participantCount: 8,
            capacity: 12,
            fillPercentage: 67,
            freeSeats: 4,
            valueLabel: '8 / 12',
            helperLabel: '4 wolnych miejsc',
            badgeLabel: 'Są miejsca',
            badgeTone: 'success',
            hasCapacity: true,
            isOverCapacity: false,
        });
    });

    it('builds capacity insights for courses without limits and missing participant data', () => {
        expect(
            buildCourseCapacityInsight({
                course: course({ capacity: null }),
                participantCount: 3,
            }),
        ).toMatchObject({
            participantCount: 3,
            capacity: null,
            fillPercentage: null,
            valueLabel: '3',
            badgeLabel: '3 uczestników',
            hasCapacity: false,
        });

        expect(
            buildCourseCapacityInsight({
                course: course({ capacity: 10 }),
                participantCount: null,
            }),
        ).toMatchObject({
            participantCount: null,
            capacity: 10,
            fillPercentage: null,
            valueLabel: '— / 10',
            badgeLabel: 'Brak danych',
            hasCapacity: true,
        });
    });
});
