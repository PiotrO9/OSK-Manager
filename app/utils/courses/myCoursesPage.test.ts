import { describe, expect, it } from 'vitest';
import type { CurrentUserCourseItem } from '~/types/courses/course';
import {
    filterMyCourses,
    formatMyCoursesHoursLabel,
    formatMyCoursesProgressLabel,
    getMyCoursesByStatus,
    getMyCoursesFeaturedCourse,
    getMyCoursesStatusTone,
    getMyCoursesTotalHours,
    sortMyCourses,
} from './myCoursesPage';

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

describe('myCoursesPage', () => {
    it('filters courses by the selected view', () => {
        const courses = [
            makeCourse({ id: 'a', status: 'ACTIVE' }),
            makeCourse({ id: 'b', status: 'FINISHED' }),
        ];

        expect(filterMyCourses(courses, 'ALL')).toHaveLength(2);
        expect(filterMyCourses(courses, 'ACTIVE').map((c) => c.id)).toEqual([
            'a',
        ]);
        expect(filterMyCourses(courses, 'FINISHED').map((c) => c.id)).toEqual([
            'b',
        ]);
    });

    it('sorts active courses first, then by progress and name', () => {
        const courses = [
            makeCourse({ id: 'finished', status: 'FINISHED', progress: 100 }),
            makeCourse({
                id: 'active-zebra',
                name: 'Zebra',
                status: 'ACTIVE',
                progress: 20,
            }),
            makeCourse({
                id: 'active-alfa',
                name: 'Alfa',
                status: 'ACTIVE',
                progress: 20,
            }),
            makeCourse({ id: 'active-high', status: 'ACTIVE', progress: 80 }),
        ];

        expect(sortMyCourses(courses).map((course) => course.id)).toEqual([
            'active-high',
            'active-alfa',
            'active-zebra',
            'finished',
        ]);
    });

    it('does not mutate the source list while sorting', () => {
        const courses = [
            makeCourse({ id: 'finished', status: 'FINISHED' }),
            makeCourse({ id: 'active', status: 'ACTIVE' }),
        ];

        sortMyCourses(courses);

        expect(courses.map((course) => course.id)).toEqual([
            'finished',
            'active',
        ]);
    });

    it('picks the featured course used by the dashboard', () => {
        const withActive = [
            makeCourse({ id: 'finished', status: 'FINISHED', progress: 100 }),
            makeCourse({ id: 'active-low', status: 'ACTIVE', progress: 20 }),
            makeCourse({ id: 'active-high', status: 'ACTIVE', progress: 80 }),
        ];
        const withoutActive = [
            makeCourse({ id: 'low', status: 'FINISHED', progress: 40 }),
            makeCourse({ id: 'high', status: 'FINISHED', progress: 90 }),
        ];

        expect(getMyCoursesFeaturedCourse(withActive)?.id).toBe('active-high');
        expect(getMyCoursesFeaturedCourse(withoutActive)?.id).toBe('high');
        expect(getMyCoursesFeaturedCourse([])).toBeNull();
    });

    it('counts courses by status and sums programme hours', () => {
        const courses = [
            makeCourse({ id: 'a', status: 'ACTIVE', totalHours: 30 }),
            makeCourse({ id: 'b', status: 'FINISHED', totalHours: 20 }),
        ];

        expect(getMyCoursesByStatus(courses, 'ACTIVE')).toHaveLength(1);
        expect(getMyCoursesTotalHours(courses)).toBe(50);
        expect(getMyCoursesTotalHours([])).toBe(0);
    });

    it('formats status tone and record labels', () => {
        const active = makeCourse({ id: 'a', progress: 25, totalHours: 30 });

        expect(getMyCoursesStatusTone('ACTIVE')).toBe('success');
        expect(getMyCoursesStatusTone('FINISHED')).toBe('neutral');
        expect(formatMyCoursesProgressLabel(active)).toBe('25%');
        expect(formatMyCoursesHoursLabel(active)).toBe('30 godz. programu');
    });
});
