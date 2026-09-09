import {
    formatCourseKindLabel,
    type CourseListItem,
} from '~/types/courses/course';

export function countUniqueCourseTypes(courses: CourseListItem[]): number {
    return new Set(courses.map((course) => course.type)).size;
}

export function countUniqueCategories(courses: CourseListItem[]): number {
    return new Set(courses.map((course) => course.category)).size;
}

export function countCoursesWithInstructor(courses: CourseListItem[]): number {
    return courses.filter((course) => course.instructor !== null).length;
}

export function formatCoursesResultsLabel(count: number): string {
    if (count === 1) {
        return '1 wynik';
    }

    if (count > 1 && count < 5) {
        return `${count} wyniki`;
    }

    return `${count} wynikow`;
}

export function formatCourseSubtitle(course: CourseListItem): string {
    return `${course.totalHours} h - ${formatCourseKindLabel(course.type)}`;
}

export function formatInstructorCell(course: CourseListItem): string {
    const name = course.instructor?.name?.trim();

    if (name && name.length > 0) {
        return name;
    }

    return 'Brak instruktora';
}

export function courseTypeBadgeClasses(course: CourseListItem): string {
    if (course.type === 'PRACTICAL') {
        return 'border-primary-200 bg-primary-50 text-primary-700';
    }

    if (course.type === 'THEORY_GROUP') {
        return 'border-warning-200 bg-warning-50 text-warning-700';
    }

    return 'border-success-200 bg-success-50 text-success-700';
}
