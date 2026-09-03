import { describe, expect, it } from 'vitest';
import type { CourseListItem } from '~/types/courses/course';

import {
    countCoursesWithInstructor,
    countUniqueCategories,
    countUniqueCourseTypes,
    courseTypeBadgeClasses,
    formatCoursesResultsLabel,
    formatCourseSubtitle,
    formatInstructorCell,
} from './managerCoursesList';

function course(overrides: Partial<CourseListItem> = {}): CourseListItem {
    return {
        id: 'course-1',
        name: 'Kurs B',
        category: 'B',
        courseType: null,
        type: 'PRACTICAL',
        totalHours: 30,
        instructor: null,
        ...overrides,
    };
}

describe('managerCoursesList utils', () => {
    it('counts unique course types, categories and courses with instructor', () => {
        const courses = [
            course({
                id: 'course-1',
                category: 'B',
                type: 'PRACTICAL',
                instructor: { id: 'instructor-1', name: 'Anna Nowak' },
            }),
            course({
                id: 'course-2',
                category: 'B',
                type: 'PRACTICAL',
            }),
            course({
                id: 'course-3',
                category: 'A',
                type: 'THEORY_GROUP',
                instructor: { id: 'instructor-2', name: 'Jan Kowalski' },
            }),
        ];

        expect(countUniqueCourseTypes(courses)).toBe(2);
        expect(countUniqueCategories(courses)).toBe(2);
        expect(countCoursesWithInstructor(courses)).toBe(2);
    });

    it('formats Polish result labels using existing UI wording', () => {
        expect(formatCoursesResultsLabel(0)).toBe('0 wynikow');
        expect(formatCoursesResultsLabel(1)).toBe('1 wynik');
        expect(formatCoursesResultsLabel(2)).toBe('2 wyniki');
        expect(formatCoursesResultsLabel(5)).toBe('5 wynikow');
    });

    it('formats course subtitle and instructor cell', () => {
        expect(
            formatCourseSubtitle(course({ totalHours: 30, type: 'PRACTICAL' })),
        ).toBe('30 h - Praktyka');
        expect(
            formatInstructorCell(
                course({
                    instructor: { id: 'instructor-1', name: ' Anna Nowak ' },
                }),
            ),
        ).toBe('Anna Nowak');
        expect(formatInstructorCell(course())).toBe('Brak instruktora');
    });

    it('returns badge classes by course type', () => {
        expect(courseTypeBadgeClasses(course({ type: 'PRACTICAL' }))).toBe(
            'border-sky-200 bg-sky-50 text-sky-700',
        );
        expect(courseTypeBadgeClasses(course({ type: 'THEORY_GROUP' }))).toBe(
            'border-amber-200 bg-amber-50 text-amber-700',
        );
        expect(courseTypeBadgeClasses(course({ type: 'EXTRA' }))).toBe(
            'border-emerald-200 bg-emerald-50 text-emerald-700',
        );
    });
});
