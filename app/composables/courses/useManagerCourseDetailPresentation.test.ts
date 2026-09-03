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

    it('uses query school id before course school id for navigation targets', () => {
        const courseRef = ref<CourseDetail | null>(
            course({ schoolId: 'school-from-course' }),
        );
        const querySchoolIdRef = querySchoolId(' school-from-query ');

        const presentation = useManagerCourseDetailPresentation({
            course: courseRef,
            querySchoolId: querySchoolIdRef,
        });

        expect(presentation.effectiveSchoolId.value).toBe('school-from-query');
        expect(presentation.backToCoursesHref.value).toEqual({
            path: '/manager/courses',
            query: { schoolId: 'school-from-query' },
        });
        expect(presentation.createCourseTarget.value).toEqual({
            path: '/manager/courses/new',
            query: { schoolId: 'school-from-query' },
        });
    });

    it('falls back to course school id and empty navigation when school id is missing', () => {
        const courseRef = ref<CourseDetail | null>(
            course({ schoolId: 'school-from-course' }),
        );
        const querySchoolIdRef = querySchoolId();

        const presentation = useManagerCourseDetailPresentation({
            course: courseRef,
            querySchoolId: querySchoolIdRef,
        });

        expect(presentation.effectiveSchoolId.value).toBe('school-from-course');

        courseRef.value = course({ schoolId: undefined });

        expect(presentation.effectiveSchoolId.value).toBe('');
        expect(presentation.backToCoursesHref.value).toBe('/manager/courses');
        expect(presentation.createCourseTarget.value).toEqual({
            path: '/manager/courses/new',
            query: {},
        });
    });

    it('derives course title, category label, subtitle and initials', () => {
        const courseRef = ref<CourseDetail | null>(course());
        const querySchoolIdRef = querySchoolId();

        const presentation = useManagerCourseDetailPresentation({
            course: courseRef,
            querySchoolId: querySchoolIdRef,
        });

        expect(presentation.courseTitle.value).toBe('Kurs B ekspres');
        expect(presentation.courseCategoryLabel.value).toBe('Kategoria B');
        expect(presentation.courseSubtitle.value).toBe(
            'Kategoria Kategoria B - aktywny kurs',
        );
        expect(presentation.courseInitials.value).toBe('KB');

        courseRef.value = null;

        expect(presentation.courseTitle.value).toBe('Szczegóły kursu');
        expect(presentation.courseSubtitle.value).toBe(
            'Parametry kursu, kursanci, godziny i ustawienia.',
        );
        expect(presentation.courseInitials.value).toBe('K');
    });

    it('derives overview and related card items from current course', () => {
        const courseRef = ref<CourseDetail | null>(
            course({
                capacity: 12,
                instructor: { id: 'user-1', name: 'Anna Nowak' },
            }),
        );
        const querySchoolIdRef = querySchoolId('school-1');

        const presentation = useManagerCourseDetailPresentation({
            course: courseRef,
            querySchoolId: querySchoolIdRef,
        });

        expect(presentation.overviewItems.value).toHaveLength(3);
        expect(presentation.relatedItems.value).toEqual([
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

        courseRef.value = null;

        expect(presentation.overviewItems.value).toEqual([]);
        expect(presentation.relatedItems.value).toEqual([]);
    });
});
