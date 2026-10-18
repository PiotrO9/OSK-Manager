import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
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

describe('useManagerCourseDetailPresentation', () => {
    beforeEach(() => {
        installVueGlobals();
    });

    it('uses course school id before legacy query school id and keeps navigation URLs clean', () => {
        const courseRef = ref<CourseDetail | null>(
            course({ schoolId: 'school-from-course' }),
        );

        const presentation = useManagerCourseDetailPresentation({
            course: courseRef,
        });

        expect(presentation.effectiveSchoolId.value).toBe('school-from-course');
        expect(presentation.backToCoursesHref.value).toBe('/manager/courses');
        expect(presentation.createCourseTarget.value).toBe(
            '/manager/courses/new',
        );
    });

    it('does not fabricate a school when the resource is missing it', () => {
        const courseRef = ref<CourseDetail | null>(
            course({ schoolId: 'school-from-course' }),
        );

        const presentation = useManagerCourseDetailPresentation({
            course: courseRef,
        });

        expect(presentation.effectiveSchoolId.value).toBe('school-from-course');

        courseRef.value = course({ schoolId: undefined });

        expect(presentation.effectiveSchoolId.value).toBe('');
        expect(presentation.backToCoursesHref.value).toBe('/manager/courses');
        expect(presentation.createCourseTarget.value).toBe(
            '/manager/courses/new',
        );

        expect(presentation.effectiveSchoolId.value).toBe('');
        expect(presentation.backToCoursesHref.value).toBe('/manager/courses');
        expect(presentation.createCourseTarget.value).toBe(
            '/manager/courses/new',
        );
    });

    it('derives course title, category label and subtitle', () => {
        const courseRef = ref<CourseDetail | null>(course());

        const presentation = useManagerCourseDetailPresentation({
            course: courseRef,
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

        const presentation = useManagerCourseDetailPresentation({
            course: courseRef,
        });

        expect(presentation.overviewItems.value).toHaveLength(3);

        courseRef.value = null;

        expect(presentation.overviewItems.value).toEqual([]);
    });
});
