import {
    formatCourseKindLabel,
    type CourseListItem,
    type CourseKind,
} from '~/types/courses/course';
import type { AdvancedFilterChip } from '~~/shared/utils/advancedFilters';

export type CourseFilterField =
    | 'name'
    | 'category'
    | 'type'
    | 'instructor'
    | 'totalHours';
export type CourseFilterCondition =
    | 'contains'
    | 'notContains'
    | 'equals'
    | 'notEquals'
    | 'empty'
    | 'notEmpty'
    | 'gte'
    | 'lte';
export interface CourseFilter {
    id: string;
    field: CourseFilterField;
    condition: CourseFilterCondition;
    value: string;
}
export interface CourseFilterOption {
    value: string;
    label: string;
}
export type CourseQuickView = 'all' | CourseKind | 'unassigned';

export const courseFilterFields: { value: CourseFilterField; label: string }[] =
    [
        { value: 'name', label: 'Nazwa kursu' },
        { value: 'category', label: 'Kategoria' },
        { value: 'type', label: 'Typ kursu' },
        { value: 'instructor', label: 'Instruktor' },
        { value: 'totalHours', label: 'Liczba godzin' },
    ];
export const courseKindOptions: CourseFilterOption[] = [
    'THEORY_GROUP',
    'PRACTICAL',
    'EXTRA',
].map((value) => ({
    value,
    label: formatCourseKindLabel(value as CourseKind),
}));
export const courseQuickViews: { value: CourseQuickView; label: string }[] = [
    { value: 'all', label: 'Wszystkie' },
    { value: 'THEORY_GROUP', label: 'Teoria' },
    { value: 'PRACTICAL', label: 'Praktyka' },
    { value: 'EXTRA', label: 'Dodatkowe' },
    { value: 'unassigned', label: 'Bez instruktora' },
];
const conditionLabels: Record<CourseFilterCondition, string> = {
    contains: 'zawiera',
    notContains: 'nie zawiera',
    equals: 'jest',
    notEquals: 'nie jest',
    empty: 'nie jest przypisany',
    notEmpty: 'jest przypisany',
    gte: 'co najmniej',
    lte: 'co najwyżej',
};

export function courseFilterConditions(
    field: CourseFilterField,
): CourseFilterOption[] {
    const conditions: CourseFilterCondition[] =
        field === 'name'
            ? ['contains', 'notContains', 'equals', 'notEquals']
            : field === 'totalHours'
              ? ['gte', 'lte', 'equals']
              : field === 'instructor'
                ? ['equals', 'notEquals', 'empty', 'notEmpty']
                : ['equals', 'notEquals'];

    return conditions.map((value) => ({
        value,
        label: conditionLabels[value],
    }));
}

export function newCourseFilter(
    field: CourseFilterField = 'name',
    id = '',
): CourseFilter {
    return {
        id,
        field,
        condition: courseFilterConditions(field)[0]!
            .value as CourseFilterCondition,
        value: '',
    };
}

export function courseFilterNeedsValue(filter: CourseFilter): boolean {
    return filter.condition !== 'empty' && filter.condition !== 'notEmpty';
}

export function validCourseFilter(filter: CourseFilter): boolean {
    if (
        !courseFilterConditions(filter.field).some(
            (item) => item.value === filter.condition,
        )
    )
        return false;

    if (!courseFilterNeedsValue(filter)) return true;

    if (!filter.value.trim() || filter.value.length > 120) return false;

    if (filter.field === 'totalHours')
        return (
            Number.isFinite(Number(filter.value)) && Number(filter.value) >= 0
        );

    return true;
}

export function normalizeCourseSearch(value: string): string {
    return value
        .toLocaleLowerCase('pl')
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replaceAll('ł', 'l')
        .trim();
}

export function matchesCourseFilter(
    course: CourseListItem,
    filter: CourseFilter,
): boolean {
    if (!validCourseFilter(filter)) return false;

    if (filter.field === 'instructor') {
        if (filter.condition === 'empty') return course.instructor === null;

        if (filter.condition === 'notEmpty') return course.instructor !== null;

        return filter.condition === 'equals'
            ? course.instructor?.id === filter.value
            : course.instructor?.id !== filter.value;
    }

    if (filter.field === 'totalHours') {
        const value = Number(filter.value);

        if (filter.condition === 'gte') return course.totalHours >= value;

        if (filter.condition === 'lte') return course.totalHours <= value;

        return course.totalHours === value;
    }

    const actual = normalizeCourseSearch(course[filter.field]);
    const expected = normalizeCourseSearch(filter.value);

    if (filter.condition === 'contains') return actual.includes(expected);

    if (filter.condition === 'notContains') return !actual.includes(expected);

    return filter.condition === 'equals'
        ? actual === expected
        : actual !== expected;
}

export function filterCourses(
    courses: CourseListItem[],
    search: string,
    quickView: CourseQuickView,
    category: string,
    filters: readonly CourseFilter[],
): CourseListItem[] {
    const words = normalizeCourseSearch(search).split(/\s+/).filter(Boolean);

    return courses.filter((course) => {
        if (category !== 'all' && course.category !== category) return false;

        if (quickView === 'unassigned' && course.instructor !== null)
            return false;

        if (
            quickView !== 'all' &&
            quickView !== 'unassigned' &&
            course.type !== quickView
        )
            return false;

        const text = normalizeCourseSearch(
            [
                course.name,
                course.category,
                formatCourseKindLabel(course.type),
                course.instructor?.name ?? '',
            ].join(' '),
        );

        return (
            words.every((word) => text.includes(word)) &&
            filters.every((filter) => matchesCourseFilter(course, filter))
        );
    });
}

export function courseFilterChip(
    filter: CourseFilter,
    instructors: CourseFilterOption[],
): AdvancedFilterChip {
    const field = courseFilterFields.find(
        (item) => item.value === filter.field,
    )!.label;
    const operator = conditionLabels[filter.condition];
    const options =
        filter.field === 'type'
            ? courseKindOptions
            : filter.field === 'instructor'
              ? instructors
              : [];
    const value =
        options.find((item) => item.value === filter.value)?.label ??
        filter.value;
    const segments: AdvancedFilterChip['segments'] = [
        { label: field, tone: 'field' },
        { label: operator, tone: 'operator' },
        ...(courseFilterNeedsValue(filter)
            ? [
                  {
                      label:
                          filter.field === 'totalHours' ? `${value} h` : value,
                      tone: 'value' as const,
                  },
              ]
            : []),
    ];

    return {
        id: filter.id,
        label: segments.map((item) => item.label).join(' '),
        segments,
    };
}
