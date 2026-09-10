import { describe, expect, it } from 'vitest';
import { buildStudentsListPath } from './studentApiRequests';
import type { StudentAdvancedFilterDraft } from '~~/shared/utils/studentAdvancedFilters';
import {
    formatStudentAdvancedFilterSegments,
    getStudentAdvancedFilterDraftForConditionChange,
    parseStudentAdvancedFiltersParam,
} from '~~/shared/utils/studentAdvancedFilters';

describe('student list search requests', () => {
    it('encodes search and combines it with school, course and quick view', () => {
        const path = buildStudentsListPath({
            schoolId: 'school',
            courseId: 'course',
            page: 1,
            limit: 20,
            search: ' Jan +48 ',
            view: 'without-pkk',
        });
        const params = new URL(path, 'http://localhost').searchParams;

        expect(Object.fromEntries(params)).toEqual({
            schoolId: 'school',
            courseId: 'course',
            page: '1',
            limit: '20',
            search: 'Jan +48',
            view: 'without-pkk',
        });
    });
    it('omits empty search and all view to preserve existing consumers', () => {
        expect(
            buildStudentsListPath({
                schoolId: 'school',
                page: 1,
                limit: 20,
                search: ' ',
                view: 'all',
            }),
        ).toBe('/api/students?schoolId=school&page=1&limit=20');
    });
    it('serializes advanced filters without UI ids', () => {
        const path = buildStudentsListPath({
            schoolId: 'school',
            page: 1,
            limit: 20,
            filters: [
                {
                    id: 'ui-filter',
                    field: 'isActive',
                    operator: 'neq',
                    value: false,
                },
                {
                    id: 'course-filter',
                    field: 'courseId',
                    operator: 'is_empty',
                },
            ],
        });
        const params = new URL(path, 'http://localhost').searchParams;

        expect(JSON.parse(params.get('filters') ?? '')).toEqual([
            { field: 'isActive', operator: 'neq', value: false },
            { field: 'courseId', operator: 'is_empty' },
        ]);
    });
    it('parses and rejects invalid advanced filters', () => {
        expect(
            parseStudentAdvancedFiltersParam(
                JSON.stringify([
                    {
                        field: 'createdAt',
                        operator: 'between',
                        value: ['2026-09-01', '2026-09-10'],
                    },
                ]),
            ),
        ).toEqual([
            {
                field: 'createdAt',
                operator: 'between',
                value: ['2026-09-01', '2026-09-10'],
            },
        ]);

        expect(() =>
            parseStudentAdvancedFiltersParam(
                JSON.stringify([
                    {
                        field: 'createdAt',
                        operator: 'between',
                        value: ['2026-09-10', '2026-09-01'],
                    },
                ]),
            ),
        ).toThrow();

        expect(() =>
            parseStudentAdvancedFiltersParam(
                JSON.stringify(
                    Array.from({ length: 9 }, () => ({
                        field: 'pkkNumber',
                        operator: 'is_empty',
                    })),
                ),
            ),
        ).toThrow();
    });
    it('formats advanced filters as semantic label segments', () => {
        expect(
            formatStudentAdvancedFilterSegments({
                field: 'lastName',
                operator: 'not_contains',
                value: 'test',
            }),
        ).toEqual([
            { label: 'Nazwisko', tone: 'field' },
            { label: 'nie zawiera', tone: 'operator' },
            { label: 'test', tone: 'value' },
        ]);

        expect(
            formatStudentAdvancedFilterSegments({
                field: 'pkkNumber',
                operator: 'is_empty',
            }),
        ).toEqual([
            { label: 'Numer PKK', tone: 'field' },
            { label: 'jest pusty', tone: 'operator' },
        ]);
    });
    it('keeps compatible draft values when advanced filter conditions change', () => {
        const cases: Array<{
            name: string;
            draft: StudentAdvancedFilterDraft;
            nextCondition: string;
            expected: StudentAdvancedFilterDraft;
        }> = [
            {
                name: 'text contains to not contains',
                draft: {
                    id: 'filter-id',
                    field: 'lastName',
                    condition: 'contains',
                    value: 'Kowal',
                },
                nextCondition: 'not_contains',
                expected: {
                    id: 'filter-id',
                    field: 'lastName',
                    condition: 'not_contains',
                    value: 'Kowal',
                    valueTo: undefined,
                },
            },
            {
                name: 'text not contains to equals',
                draft: {
                    id: 'filter-id',
                    field: 'firstName',
                    condition: 'not_contains',
                    value: 'Jan',
                },
                nextCondition: 'eq',
                expected: {
                    id: 'filter-id',
                    field: 'firstName',
                    condition: 'eq',
                    value: 'Jan',
                    valueTo: undefined,
                },
            },
            {
                name: 'text equals to not equals',
                draft: {
                    id: 'filter-id',
                    field: 'email',
                    condition: 'eq',
                    value: 'test@example.com',
                },
                nextCondition: 'neq',
                expected: {
                    id: 'filter-id',
                    field: 'email',
                    condition: 'neq',
                    value: 'test@example.com',
                    valueTo: undefined,
                },
            },
            {
                name: 'pkk text condition to another text condition',
                draft: {
                    id: 'filter-id',
                    field: 'pkkNumber',
                    condition: 'contains',
                    value: '00047',
                },
                nextCondition: 'not_contains',
                expected: {
                    id: 'filter-id',
                    field: 'pkkNumber',
                    condition: 'not_contains',
                    value: '00047',
                    valueTo: undefined,
                },
            },
            {
                name: 'phone text condition to another text condition',
                draft: {
                    id: 'filter-id',
                    field: 'phone',
                    condition: 'contains',
                    value: '+48',
                },
                nextCondition: 'not_contains',
                expected: {
                    id: 'filter-id',
                    field: 'phone',
                    condition: 'not_contains',
                    value: '+48',
                    valueTo: undefined,
                },
            },
            {
                name: 'boolean condition to negated boolean condition',
                draft: {
                    id: 'filter-id',
                    field: 'isActive',
                    condition: 'eq',
                    value: false,
                },
                nextCondition: 'neq',
                expected: {
                    id: 'filter-id',
                    field: 'isActive',
                    condition: 'neq',
                    value: false,
                    valueTo: undefined,
                },
            },
            {
                name: 'course condition to negated course condition',
                draft: {
                    id: 'filter-id',
                    field: 'courseId',
                    condition: 'eq',
                    value: 'course-1',
                },
                nextCondition: 'neq',
                expected: {
                    id: 'filter-id',
                    field: 'courseId',
                    condition: 'neq',
                    value: 'course-1',
                    valueTo: undefined,
                },
            },
            {
                name: 'single date condition to another single date condition',
                draft: {
                    id: 'filter-id',
                    field: 'createdAt',
                    condition: 'before',
                    value: '2026-09-10',
                },
                nextCondition: 'after',
                expected: {
                    id: 'filter-id',
                    field: 'createdAt',
                    condition: 'after',
                    value: '2026-09-10',
                    valueTo: undefined,
                },
            },
            {
                name: 'date range to single date condition',
                draft: {
                    id: 'filter-id',
                    field: 'createdAt',
                    condition: 'between',
                    value: '2026-09-01',
                    valueTo: '2026-09-10',
                },
                nextCondition: 'before',
                expected: {
                    id: 'filter-id',
                    field: 'createdAt',
                    condition: 'before',
                    value: '2026-09-01',
                    valueTo: undefined,
                },
            },
            {
                name: 'relation boolean condition to negated relation condition',
                draft: {
                    id: 'filter-id',
                    field: 'hasOverduePayments',
                    condition: 'has',
                },
                nextCondition: 'not_has',
                expected: {
                    id: 'filter-id',
                    field: 'hasOverduePayments',
                    condition: 'not_has',
                    value: undefined,
                    valueTo: undefined,
                },
            },
        ];

        for (const { draft, expected, name, nextCondition } of cases) {
            expect(
                getStudentAdvancedFilterDraftForConditionChange(
                    draft,
                    nextCondition,
                ),
                name,
            ).toEqual(expected);
        }

        expect(
            getStudentAdvancedFilterDraftForConditionChange(
                {
                    id: 'filter-id',
                    field: 'pkkNumber',
                    condition: 'contains',
                    value: '00047',
                },
                'is_empty',
            ),
        ).toEqual({
            id: 'filter-id',
            field: 'pkkNumber',
            condition: 'is_empty',
            value: undefined,
            valueTo: undefined,
        });
    });
});
