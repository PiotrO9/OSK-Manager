import { describe, expect, it } from 'vitest';
import type { CourseListItem } from '~/types/courses/course';
import {
    filterCourses,
    matchesCourseFilter,
    newCourseFilter,
    validCourseFilter,
    courseFilterChip,
    type CourseFilter,
} from './courseFilters';

const courses: CourseListItem[] = [
    {
        id: '1',
        name: 'Szkoła jazdy B',
        category: 'B',
        type: 'PRACTICAL',
        courseType: null,
        totalHours: 30,
        instructor: { id: 'i1', name: 'Łukasz Żółć', avatarUrl: null },
    },
    {
        id: '2',
        name: 'Teoria A',
        category: 'A',
        type: 'THEORY_GROUP',
        courseType: null,
        totalHours: 20,
        instructor: null,
    },
    {
        id: '3',
        name: 'Doszkalanie B',
        category: 'B',
        type: 'EXTRA',
        courseType: null,
        totalHours: 5,
        instructor: null,
    },
];
const rule = (
    field: CourseFilter['field'],
    condition: CourseFilter['condition'],
    value = '',
): CourseFilter => ({ id: 'test', field, condition, value });

describe('course filtering', () => {
    it('matches all search words across name and instructor, ignoring Polish diacritics', () => {
        expect(
            filterCourses(
                courses,
                ' SZKOLA lukasz zolc ',
                'all',
                'all',
                [],
            ).map((item) => item.id),
        ).toEqual(['1']);
        expect(
            filterCourses(courses, 'lukasz teoria', 'all', 'all', []),
        ).toEqual([]);
    });
    it('combines category, quick view, search and all advanced rules before pagination', () => {
        const filters = [
            rule('totalHours', 'gte', '20'),
            rule('totalHours', 'lte', '30'),
            rule('instructor', 'notEmpty'),
        ];

        expect(
            filterCourses(courses, 'jazdy', 'PRACTICAL', 'B', filters),
        ).toEqual([courses[0]]);
        expect(filterCourses(courses, '', 'PRACTICAL', 'A', filters)).toEqual(
            [],
        );
        expect(
            filterCourses(courses, '', 'unassigned', 'all', []).map(
                (item) => item.id,
            ),
        ).toEqual(['2', '3']);
    });
    it('compares numeric hours including exact boundaries and rejects invalid numbers', () => {
        expect(
            matchesCourseFilter(courses[0]!, rule('totalHours', 'gte', '30')),
        ).toBe(true);
        expect(
            matchesCourseFilter(courses[0]!, rule('totalHours', 'lte', '29')),
        ).toBe(false);
        expect(
            matchesCourseFilter(
                courses[0]!,
                rule('totalHours', 'equals', '30'),
            ),
        ).toBe(true);

        for (const value of ['', ' ', '-1', 'Infinity', 'abc'])
            expect(validCourseFilter(rule('totalHours', 'gte', value))).toBe(
                false,
            );

        expect(validCourseFilter(rule('totalHours', 'gte', '0'))).toBe(true);
    });
    it('uses instructor IDs and distinguishes absent assignments', () => {
        expect(
            matchesCourseFilter(
                courses[0]!,
                rule('instructor', 'equals', 'i1'),
            ),
        ).toBe(true);
        expect(
            matchesCourseFilter(courses[1]!, rule('instructor', 'empty')),
        ).toBe(true);
        expect(
            matchesCourseFilter(courses[1]!, rule('instructor', 'notEmpty')),
        ).toBe(false);
        expect(
            matchesCourseFilter(
                courses[1]!,
                rule('instructor', 'notEquals', 'i1'),
            ),
        ).toBe(true);
    });
    it('supports negative text and enum conditions without accepting mismatched operators', () => {
        expect(
            matchesCourseFilter(
                courses[0]!,
                rule('name', 'notContains', 'teoria'),
            ),
        ).toBe(true);
        expect(
            matchesCourseFilter(
                courses[0]!,
                rule('name', 'equals', 'szkola jazdy b'),
            ),
        ).toBe(true);
        expect(
            matchesCourseFilter(
                courses[0]!,
                rule('category', 'notEquals', 'B'),
            ),
        ).toBe(false);
        expect(
            matchesCourseFilter(
                courses[0]!,
                rule('type', 'equals', 'PRACTICAL'),
            ),
        ).toBe(true);
        expect(validCourseFilter(rule('totalHours', 'contains', '3'))).toBe(
            false,
        );
        expect(newCourseFilter('totalHours', 'test')).toEqual(
            rule('totalHours', 'gte', ''),
        );
    });
    it('labels chips with readable values instead of instructor IDs', () => {
        expect(
            courseFilterChip(rule('instructor', 'equals', 'i1'), [
                { value: 'i1', label: 'Łukasz Żółć' },
            ]).label,
        ).toBe('Instruktor jest Łukasz Żółć');
        expect(
            courseFilterChip(rule('totalHours', 'gte', '30'), []).label,
        ).toBe('Liczba godzin co najmniej 30 h');
    });
});
