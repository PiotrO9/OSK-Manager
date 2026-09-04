import { describe, expect, it } from 'vitest';
import type { CourseTypeOption } from '~/types/courses/courseType';
import {
    buildInstructorEditCourseTypeRows,
    normalizeInstructorCourseTypeIds,
    parseInstructorExperienceYearsInput,
    updateInstructorCourseTypeSelection,
} from './managerInstructorEditDialog';

const courseType = (
    id: string,
    overrides: Partial<CourseTypeOption> = {},
): CourseTypeOption => ({
    id,
    code: id.toUpperCase(),
    name: id.toUpperCase(),
    ...overrides,
});

describe('manager instructor edit dialog utilities', () => {
    it('parses experience years input with the current form fallback behavior', () => {
        expect(parseInstructorExperienceYearsInput('')).toBe(0);
        expect(parseInstructorExperienceYearsInput(' 12 ')).toBe(12);
        expect(parseInstructorExperienceYearsInput('7.5')).toBe(7);
        expect(parseInstructorExperienceYearsInput('abc')).toBe(0);
    });

    it('normalizes course type ids by trimming, removing blanks and deduplicating', () => {
        expect(normalizeInstructorCourseTypeIds([' a ', '', 'b', 'a'])).toEqual(
            ['a', 'b'],
        );
    });

    it('builds available and unavailable course type rows', () => {
        expect(
            buildInstructorEditCourseTypeRows(
                [courseType('a'), courseType('b')],
                [courseType('b'), courseType('c')],
            ),
        ).toEqual([
            {
                item: courseType('a'),
                isUnavailable: false,
            },
            {
                item: courseType('b'),
                isUnavailable: false,
            },
            {
                item: courseType('c'),
                isUnavailable: true,
            },
        ]);
    });

    it('updates selected course type ids from checkbox state', () => {
        expect(updateInstructorCourseTypeSelection(['a'], 'b', true)).toEqual([
            'a',
            'b',
        ]);
        expect(updateInstructorCourseTypeSelection(['a'], 'a', true)).toEqual([
            'a',
        ]);
        expect(
            updateInstructorCourseTypeSelection(['a', 'b'], 'a', false),
        ).toEqual(['b']);
        expect(
            updateInstructorCourseTypeSelection(
                ['a', 'b'],
                'a',
                'indeterminate',
            ),
        ).toEqual(['b']);
    });
});
