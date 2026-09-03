import { computed, type Ref } from 'vue';
import type { StatusTone } from '~/components/app/ui/types';
import type { CurrentUserCourseItem } from '~/types/courses/course';

export function getMyCoursesFeaturedCourse(
    courses: CurrentUserCourseItem[],
): CurrentUserCourseItem | null {
    const activeCourses = getMyCoursesByStatus(courses, 'ACTIVE');
    const candidates = activeCourses.length > 0 ? activeCourses : courses;

    return [...candidates].sort((a, b) => b.progress - a.progress)[0] ?? null;
}

export function getMyCoursesByStatus(
    courses: CurrentUserCourseItem[],
    status: CurrentUserCourseItem['status'],
): CurrentUserCourseItem[] {
    return courses.filter((course) => course.status === status);
}

export function getMyCoursesTotalHours(
    courses: CurrentUserCourseItem[],
): number {
    return courses.reduce((sum, course) => sum + course.totalHours, 0);
}

export function getMyCoursesAverageProgress(
    courses: CurrentUserCourseItem[],
): number {
    if (courses.length === 0) {
        return 0;
    }

    const totalProgress = courses.reduce(
        (sum, course) => sum + course.progress,
        0,
    );

    return Math.round(totalProgress / courses.length);
}

export function formatMyCoursesVisibleCoursesLabel(count: number): string {
    if (count === 1) {
        return '1 wynik';
    }

    if (count > 1 && count < 5) {
        return `${count} wyniki`;
    }

    return `${count} wynikow`;
}

export function getMyCoursesStatusTone(
    status: CurrentUserCourseItem['status'],
): StatusTone {
    return status === 'ACTIVE' ? 'success' : 'neutral';
}

export function formatMyCoursesProgressLabel(
    course: CurrentUserCourseItem,
): string {
    return `${course.progress}%`;
}

export function useMyCoursesPresentation(
    courses: Ref<CurrentUserCourseItem[]>,
) {
    const activeCourses = computed(() =>
        getMyCoursesByStatus(courses.value, 'ACTIVE'),
    );

    const completedCourses = computed(() =>
        getMyCoursesByStatus(courses.value, 'FINISHED'),
    );

    const featuredCourse = computed(() =>
        getMyCoursesFeaturedCourse(courses.value),
    );

    const totalHours = computed(() => getMyCoursesTotalHours(courses.value));

    const averageProgress = computed(() =>
        getMyCoursesAverageProgress(courses.value),
    );

    const visibleCoursesLabel = computed(() =>
        formatMyCoursesVisibleCoursesLabel(courses.value.length),
    );

    return {
        activeCourses,
        averageProgress,
        completedCourses,
        featuredCourse,
        totalHours,
        visibleCoursesLabel,
    };
}
