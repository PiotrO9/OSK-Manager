import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, ref } from 'vue';
import type { CourseListItem } from '~/types/courses/course';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { StudentListItem } from '~/types/students/student';

const fetchSchoolsList = vi.fn();
const fetchCoursesList = vi.fn();
const fetchStudentsPage = vi.fn();

function installNuxtStudentsDataGlobals(): void {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('useDrivingSchoolsApi', () => ({
        fetchList: fetchSchoolsList,
    }));
    vi.stubGlobal('useCoursesApi', () => ({
        fetchList: fetchCoursesList,
    }));
    vi.stubGlobal('useStudentsApi', () => ({
        fetchList: fetchStudentsPage,
    }));
}

function school(overrides: Partial<DrivingSchool> = {}): DrivingSchool {
    return {
        id: 'school-1',
        name: 'OSK Test',
        city: null,
        address: null,
        ...overrides,
    };
}

function course(overrides: Partial<CourseListItem> = {}): CourseListItem {
    return {
        id: 'course-1',
        name: 'Kurs B',
        category: 'B',
        courseType: null,
        type: 'PRACTICAL',
        totalHours: 30,
        instructor: null,
        ...overrides,
    };
}

function student(overrides: Partial<StudentListItem> = {}): StudentListItem {
    return {
        id: 'student-1',
        userId: 'user-1',
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'jan@example.com',
        phone: null,
        pkkNumber: null,
        isActive: true,
        createdAt: '2026-09-03T10:00:00.000Z',
        avatarUrl: overrides.avatarUrl ?? null,
        ...overrides,
    };
}

describe('useManagerStudentsData', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        installNuxtStudentsDataGlobals();
    });

    it('loads schools and exposes selected school', async () => {
        fetchSchoolsList.mockResolvedValue([school()]);

        const { useManagerStudentsData } =
            await import('./useManagerStudentsData');
        const data = useManagerStudentsData();

        await data.loadSchools();
        data.activeSchoolId.value = 'school-1';

        expect(fetchSchoolsList).toHaveBeenCalledTimes(1);
        expect(data.schools.value).toEqual([school()]);
        expect(data.activeSchool.value).toEqual(school());
        expect(data.schoolsLoadError.value).toBeNull();
        expect(data.isSchoolsLoading.value).toBe(false);
    });

    it('loads courses for active school and clears courses without school', async () => {
        fetchCoursesList.mockResolvedValue([course()]);

        const { useManagerStudentsData } =
            await import('./useManagerStudentsData');
        const data = useManagerStudentsData();

        await data.loadCoursesForFilter();

        expect(fetchCoursesList).not.toHaveBeenCalled();
        expect(data.courses.value).toEqual([]);

        data.activeSchoolId.value = ' school-1 ';
        await data.loadCoursesForFilter();
        data.activeCourseId.value = 'course-1';

        expect(fetchCoursesList).toHaveBeenCalledWith('school-1');
        expect(data.courses.value).toEqual([course()]);
        expect(data.activeCourse.value).toEqual(course());
        expect(data.coursesLoadError.value).toBeNull();
    });

    it('loads students with pagination and optional course filter', async () => {
        fetchStudentsPage.mockResolvedValue({
            items: [
                student({ id: 'student-1', pkkNumber: 'PKK1' }),
                student({
                    id: 'student-2',
                    userId: 'user-2',
                    isActive: false,
                }),
            ],
            total: 42,
            page: 2,
            limit: 20,
            totalPages: 3,
        });

        const { useManagerStudentsData } =
            await import('./useManagerStudentsData');
        const data = useManagerStudentsData();

        data.activeSchoolId.value = 'school-1';
        data.activeCourseId.value = ' course-1 ';
        data.currentPage.value = 2;

        await data.loadStudents();

        expect(fetchStudentsPage).toHaveBeenCalledWith({
            schoolId: 'school-1',
            page: 2,
            limit: 20,
            courseId: 'course-1',
        });
        expect(data.students.value).toHaveLength(2);
        expect(data.studentsPagination.value).toEqual({
            total: 42,
            totalPages: 3,
        });
        expect(data.totalStudentsCount.value).toBe(42);
        expect(data.activeStudentsOnPage.value).toBe(1);
        expect(data.studentsWithPkkOnPage.value).toBe(1);
        expect(data.visibleStudentsLabel.value).toBe('2 z 42 wyników');
    });

    it('ignores stale courses responses from older school filter requests', async () => {
        const olderCourse = course({ id: 'older-course' });
        const newerCourse = course({ id: 'newer-course' });
        let resolveOlder!: (items: CourseListItem[]) => void;

        fetchCoursesList
            .mockReturnValueOnce(
                new Promise<CourseListItem[]>((resolve) => {
                    resolveOlder = resolve;
                }),
            )
            .mockResolvedValueOnce([newerCourse]);

        const { useManagerStudentsData } =
            await import('./useManagerStudentsData');
        const data = useManagerStudentsData();

        data.activeSchoolId.value = 'school-1';
        const olderLoad = data.loadCoursesForFilter();

        data.activeSchoolId.value = 'school-2';
        const newerLoad = data.loadCoursesForFilter();

        await newerLoad;

        expect(data.courses.value).toEqual([newerCourse]);

        resolveOlder([olderCourse]);
        await olderLoad;

        expect(data.courses.value).toEqual([newerCourse]);
    });

    it('ignores stale students responses from older list requests', async () => {
        const olderStudent = student({ id: 'older-student' });
        const newerStudent = student({ id: 'newer-student' });
        let resolveOlder!: (payload: {
            items: StudentListItem[];
            total: number;
            totalPages: number;
        }) => void;

        fetchStudentsPage
            .mockReturnValueOnce(
                new Promise<{
                    items: StudentListItem[];
                    total: number;
                    totalPages: number;
                }>((resolve) => {
                    resolveOlder = resolve;
                }),
            )
            .mockResolvedValueOnce({
                items: [newerStudent],
                total: 1,
                totalPages: 1,
            });

        const { useManagerStudentsData } =
            await import('./useManagerStudentsData');
        const data = useManagerStudentsData();

        data.activeSchoolId.value = 'school-1';
        data.currentPage.value = 1;
        const olderLoad = data.loadStudents();

        data.currentPage.value = 2;
        const newerLoad = data.loadStudents();

        await newerLoad;

        expect(data.students.value).toEqual([newerStudent]);

        resolveOlder({
            items: [olderStudent],
            total: 1,
            totalPages: 1,
        });
        await olderLoad;

        expect(data.students.value).toEqual([newerStudent]);
    });

    it('clears students and skips API calls without active school', async () => {
        const { useManagerStudentsData } =
            await import('./useManagerStudentsData');
        const data = useManagerStudentsData();

        data.students.value = [student()];
        data.studentsPagination.value = { total: 1, totalPages: 1 };

        await data.loadStudents();

        expect(fetchStudentsPage).not.toHaveBeenCalled();
        expect(data.students.value).toEqual([]);
        expect(data.studentsPagination.value).toBeNull();
    });

    it('exposes loading errors and clears stale data on failures', async () => {
        fetchSchoolsList.mockRejectedValue(new Error('Schools down'));
        fetchCoursesList.mockRejectedValue(new Error('Courses down'));
        fetchStudentsPage.mockRejectedValue({ statusCode: 403 });

        const { useManagerStudentsData } =
            await import('./useManagerStudentsData');
        const data = useManagerStudentsData();

        await data.loadSchools();

        expect(data.schoolsLoadError.value).toBe('Schools down');

        data.activeSchoolId.value = 'school-1';
        data.courses.value = [course()];
        await data.loadCoursesForFilter();

        expect(data.courses.value).toEqual([]);
        expect(data.coursesLoadError.value).toBe('Courses down');

        data.students.value = [student()];
        data.studentsPagination.value = { total: 1, totalPages: 1 };
        await data.loadStudents();

        expect(data.students.value).toEqual([]);
        expect(data.studentsPagination.value).toBeNull();
        expect(data.studentsLoadError.value).toBe(
            'Brak dostępu do listy kursantów dla wybranej szkoły.',
        );
    });
    it('forwards search and view while ignoring a request invalidated during typing', async () => {
        const { useManagerStudentsData } =
            await import('./useManagerStudentsData');
        const data = useManagerStudentsData();

        data.activeSchoolId.value = 'school-1';
        let resolveOld!: (value: unknown) => void;

        fetchStudentsPage.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveOld = resolve;
                }),
        );
        const pending = data.loadStudents();

        data.search.value = '  Jan Kowalski  ';
        data.quickView.value = 'without-pkk';
        data.invalidateStudentsRequest();
        resolveOld({ items: [student()], total: 1, totalPages: 1 });
        await pending;
        expect(data.students.value).toEqual([]);
        expect(data.isStudentsLoading.value).toBe(true);
        fetchStudentsPage.mockResolvedValue({
            items: [],
            total: 0,
            totalPages: 0,
        });
        await data.loadStudents();
        expect(fetchStudentsPage).toHaveBeenLastCalledWith({
            schoolId: 'school-1',
            page: 1,
            limit: 20,
            search: 'Jan Kowalski',
            view: 'without-pkk',
        });
        expect(data.isStudentsLoading.value).toBe(false);
    });
});
