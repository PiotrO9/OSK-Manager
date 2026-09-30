import type { StatusTone } from '~/types/ui';
import type { CurrentUserCourseItem } from '~/types/courses/course';

export type MyCoursesFilter = 'ALL' | 'ACTIVE' | 'FINISHED';

export function filterMyCourses(
    courses: readonly CurrentUserCourseItem[],
    filter: MyCoursesFilter,
): CurrentUserCourseItem[] {
    if (filter === 'ALL') {
        return [...courses];
    }

    return courses.filter((course) => course.status === filter);
}

export function sortMyCourses(
    courses: readonly CurrentUserCourseItem[],
): CurrentUserCourseItem[] {
    return [...courses].sort((left, right) => {
        if (left.status !== right.status) {
            return left.status === 'ACTIVE' ? -1 : 1;
        }

        if (left.progress !== right.progress) {
            return right.progress - left.progress;
        }

        return left.name.localeCompare(right.name, 'pl-PL');
    });
}

export function getMyCoursesByStatus(
    courses: readonly CurrentUserCourseItem[],
    status: CurrentUserCourseItem['status'],
): CurrentUserCourseItem[] {
    return courses.filter((course) => course.status === status);
}

export function getMyCoursesFeaturedCourse(
    courses: readonly CurrentUserCourseItem[],
): CurrentUserCourseItem | null {
    const activeCourses = getMyCoursesByStatus(courses, 'ACTIVE');
    const candidates = activeCourses.length > 0 ? activeCourses : courses;

    return [...candidates].sort((a, b) => b.progress - a.progress)[0] ?? null;
}

export function getMyCoursesTotalHours(
    courses: readonly CurrentUserCourseItem[],
): number {
    return courses.reduce((sum, course) => sum + course.totalHours, 0);
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

export function formatMyCoursesHoursLabel(
    course: CurrentUserCourseItem,
): string {
    return `${course.totalHours} godz. programu`;
}
