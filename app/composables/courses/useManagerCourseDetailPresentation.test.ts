import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import type { LocationQueryValue } from 'vue-router';
import type { CourseDetail } from '~/types/courses/course';

import { useManagerCourseDetailPresentation } from './useManagerCourseDetailPresentation';

function installVueGlobals() {
    vi.stubGlobal('computed', computed);
}

function course(overrides: Partial<CourseDetail> = {}): CourseDetail {
    return {
        id: 'course-1',
        schoolId: 'school-1',
        name: 'Kurs B ekspres',
        category: 'B',
        courseType: { id: 'type-b', code: 'B', name: 'Kategoria B' },
        type: 'PRACTICAL',
        totalHours: 30,
        capacity: null,
        instructor: null,
        ...overrides,
    };
}

function querySchoolId(value?: LocationQueryValue | LocationQueryValue[]) {
    return ref<LocationQueryValue | LocationQueryValue[] | undefined>(value);
}

describe('useManagerCourseDetailPresentation', () => {
    beforeEach(() => {
        installVueGlobals();
    });

    it('uses course school id before legacy query school id for navigation targets', () => {
        const courseRef = ref<CourseDetail | null>(
            course({ schoolId: 'school-from-course' }),
        );
        const querySchoolIdRef = querySchoolId(' school-from-query ');

        const presentation = useManagerCourseDetailPresentation({
            course: courseRef,
            querySchoolId: querySchoolIdRef,
        });

        expect(presentation.effectiveSchoolId.value).toBe('school-from-course');
        expect(presentation.backToCoursesHref.value).toEqual({
            path: '/manager/courses',
            query: { schoolId: 'school-from-course' },
        });
        expect(presentation.createCourseTarget.value).toEqual({
            path: '/manager/courses/new',
            query: { schoolId: 'school-from-course' },
        });
    });

    it('falls back to legacy query school id and empty navigation when school id is missing', () => {
        const courseRef = ref<CourseDetail | null>(
            course({ schoolId: 'school-from-course' }),
        );
        const querySchoolIdRef = querySchoolId('school-from-query');

        const presentation = useManagerCourseDetailPresentation({
            course: courseRef,
            querySchoolId: querySchoolIdRef,
        });

        expect(presentation.effectiveSchoolId.value).toBe('school-from-course');

        courseRef.value = course({ schoolId: undefined });

        expect(presentation.effectiveSchoolId.value).toBe('school-from-query');
        expect(presentation.backToCoursesHref.value).toEqual({
            path: '/manager/courses',
            query: { schoolId: 'school-from-query' },
        });
        expect(presentation.createCourseTarget.value).toEqual({
            path: '/manager/courses/new',
            query: { schoolId: 'school-from-query' },
        });

        querySchoolIdRef.value = undefined;

        expect(presentation.effectiveSchoolId.value).toBe('');
        expect(presentation.backToCoursesHref.value).toBe('/manager/courses');
        expect(presentation.createCourseTarget.value).toEqual({
            path: '/manager/courses/new',
            query: {},
        });
    });

    it('derives course title, category label and subtitle', () => {
        const courseRef = ref<CourseDetail | null>(course());
        const querySchoolIdRef = querySchoolId();

        const presentation = useManagerCourseDetailPresentation({
            course: courseRef,
            querySchoolId: querySchoolIdRef,
        });

        expect(presentation.courseTitle.value).toBe('Kurs B ekspres');
        expect(presentation.courseCategoryLabel.value).toBe('Kategoria B');
        expect(presentation.courseSubtitle.value).toBe(
            'Kategoria B - aktywny kurs',
        );

        courseRef.value = null;

        expect(presentation.courseTitle.value).toBe('Szczegóły kursu');
        expect(presentation.courseSubtitle.value).toBe(
            'Parametry kursu, kursanci, godziny i ustawienia.',
        );
    });

    it('derives overview items from current course', () => {
        const courseRef = ref<CourseDetail | null>(
            course({
                capacity: 12,
                instructor: {
                    id: 'user-1',
                    name: 'Anna Nowak',
                    avatarUrl: null,
                },
            }),
        );
        const querySchoolIdRef = querySchoolId('school-1');

        const presentation = useManagerCourseDetailPresentation({
            course: courseRef,
            querySchoolId: querySchoolIdRef,
        });

        expect(presentation.overviewItems.value).toHaveLength(3);

        courseRef.value = null;

        expect(presentation.overviewItems.value).toEqual([]);
    });
});
