import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import type { CurrentUserCourseItem } from '~/types/courses/course';
import {
    formatMyCoursesProgressLabel,
    formatMyCoursesVisibleCoursesLabel,
    getMyCoursesAverageProgress,
    getMyCoursesByStatus,
    getMyCoursesFeaturedCourse,
    getMyCoursesStatusTone,
    getMyCoursesTotalHours,
    useMyCoursesPresentation,
} from './useMyCoursesPresentation';

function makeCourse(
    overrides: Partial<CurrentUserCourseItem> &
        Pick<CurrentUserCourseItem, 'id'>,
): CurrentUserCourseItem {
    const { id, ...rest } = overrides;

    return {
        id,
        schoolId: 'school-1',
        name: `Kurs ${id}`,
        status: 'ACTIVE',
        type: 'PRACTICAL',
        totalHours: 30,
        progress: 0,
        ...rest,
    };
}

describe('useMyCoursesPresentation', () => {
    it('wybiera wyróżniony kurs z aktywnych kursów o najwyższym postępie', () => {
        const courses = [
            makeCourse({ id: 'finished', status: 'FINISHED', progress: 100 }),
            makeCourse({ id: 'active-low', status: 'ACTIVE', progress: 20 }),
            makeCourse({ id: 'active-high', status: 'ACTIVE', progress: 80 }),
        ];

        expect(getMyCoursesFeaturedCourse(courses)?.id).toBe('active-high');
    });

    it('używa dowolnego kursu jako wyróżnionego, gdy nie ma aktywnych', () => {
        const courses = [
            makeCourse({
                id: 'finished-low',
                status: 'FINISHED',
                progress: 40,
            }),
            makeCourse({
                id: 'finished-high',
                status: 'FINISHED',
                progress: 90,
            }),
        ];

        expect(getMyCoursesFeaturedCourse(courses)?.id).toBe('finished-high');
    });

    it('liczy sekcje i etykiety widoku moich kursów', () => {
        const courses = [
            makeCourse({
                id: 'a',
                status: 'ACTIVE',
                totalHours: 30,
                progress: 20,
            }),
            makeCourse({
                id: 'b',
                status: 'FINISHED',
                totalHours: 20,
                progress: 100,
            }),
        ];

        expect(getMyCoursesByStatus(courses, 'ACTIVE')).toHaveLength(1);
        expect(getMyCoursesTotalHours(courses)).toBe(50);
        expect(getMyCoursesAverageProgress(courses)).toBe(60);
        expect(formatMyCoursesVisibleCoursesLabel(0)).toBe('0 wynikow');
        expect(formatMyCoursesVisibleCoursesLabel(1)).toBe('1 wynik');
        expect(formatMyCoursesVisibleCoursesLabel(3)).toBe('3 wyniki');
        expect(formatMyCoursesVisibleCoursesLabel(5)).toBe('5 wynikow');
    });

    it('formatuje status i progress dla tabeli/listy kursów', () => {
        const active = makeCourse({ id: 'a', status: 'ACTIVE', progress: 25 });
        const finished = makeCourse({ id: 'b', status: 'FINISHED' });

        expect(getMyCoursesStatusTone(active.status)).toBe('success');
        expect(getMyCoursesStatusTone(finished.status)).toBe('neutral');
        expect(formatMyCoursesProgressLabel(active)).toBe('25%');
    });

    it('zwraca reaktywne wartości prezentacyjne', () => {
        const courses = ref<CurrentUserCourseItem[]>([]);
        const presentation = useMyCoursesPresentation(courses);

        expect(presentation.visibleCoursesLabel.value).toBe('0 wynikow');
        expect(presentation.averageProgress.value).toBe(0);

        courses.value = [
            makeCourse({
                id: 'a',
                status: 'ACTIVE',
                totalHours: 10,
                progress: 30,
            }),
            makeCourse({
                id: 'b',
                status: 'FINISHED',
                totalHours: 20,
                progress: 90,
            }),
        ];

        expect(presentation.activeCourses.value).toHaveLength(1);
        expect(presentation.completedCourses.value).toHaveLength(1);
        expect(presentation.totalHours.value).toBe(30);
        expect(presentation.averageProgress.value).toBe(60);
        expect(presentation.featuredCourse.value?.id).toBe('a');
    });
});
