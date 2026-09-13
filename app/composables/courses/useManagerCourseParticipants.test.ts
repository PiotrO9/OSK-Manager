import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, nextTick, readonly, ref, shallowRef, watch } from 'vue';
import type { CourseDetail } from '~/types/courses/course';
import type {
    StudentListItem,
    StudentListPage,
} from '~/types/students/student';

import { useManagerCourseParticipants } from './useManagerCourseParticipants';

function installVueGlobals() {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('shallowRef', shallowRef);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('readonly', readonly);
    vi.stubGlobal('watch', watch);
}

async function flushReactiveJobs() {
    await nextTick();
    await Promise.resolve();
    await nextTick();
}

function course(overrides: Partial<CourseDetail> = {}): CourseDetail {
    return {
        id: 'course-1',
        schoolId: 'school-1',
        name: 'Kurs B',
        category: 'B',
        courseType: { id: 'type-b', code: 'B', name: 'Kategoria B' },
        type: 'PRACTICAL',
        totalHours: 30,
        capacity: null,
        instructor: null,
        ...overrides,
    };
}

function student(overrides: Partial<StudentListItem> = {}): StudentListItem {
    return {
        id: 'student-1',
        userId: 'user-1',
        firstName: 'Anna',
        lastName: 'Nowak',
        email: 'anna@example.test',
        phone: null,
        avatarUrl: null,
        pkkNumber: null,
        isActive: true,
        createdAt: '2026-09-12T10:00:00.000Z',
        ...overrides,
    };
}

function page(overrides: Partial<StudentListPage> = {}): StudentListPage {
    return {
        items: [student()],
        total: 12,
        page: 1,
        limit: 8,
        totalPages: 2,
        ...overrides,
    };
}

describe('useManagerCourseParticipants', () => {
    beforeEach(() => {
        installVueGlobals();
    });

    it('loads course participants for the current course and school', async () => {
        const fetchStudentsList = vi.fn().mockResolvedValue(page());
        const courseRef = ref<CourseDetail | null>(course());
        const schoolId = ref('school-1');

        const state = useManagerCourseParticipants({
            course: courseRef,
            effectiveSchoolId: schoolId,
            fetchStudentsList,
        });

        await flushReactiveJobs();

        expect(fetchStudentsList).toHaveBeenCalledWith({
            schoolId: 'school-1',
            courseId: 'course-1',
            page: 1,
            limit: 8,
        });
        expect(state.participants.value).toEqual([student()]);
        expect(state.participantsCurrentPage.value).toBe(1);
        expect(state.participantsPagination.value).toEqual({
            total: 12,
            totalPages: 2,
            pageSize: 8,
        });
        expect(state.participantsTotal.value).toBe(12);
        expect(state.participantsLoadError.value).toBeNull();
    });

    it('loads next and previous participant pages', async () => {
        const firstPage = page({
            items: [student({ id: 'student-1', userId: 'user-1' })],
            page: 1,
        });
        const secondPage = page({
            items: [student({ id: 'student-2', userId: 'user-2' })],
            page: 2,
        });
        const fetchStudentsList = vi
            .fn()
            .mockResolvedValueOnce(firstPage)
            .mockResolvedValueOnce(secondPage)
            .mockResolvedValueOnce(firstPage);

        const state = useManagerCourseParticipants({
            course: ref<CourseDetail | null>(course()),
            effectiveSchoolId: ref('school-1'),
            fetchStudentsList,
        });

        await flushReactiveJobs();

        await state.loadNextParticipantsPage();

        expect(fetchStudentsList).toHaveBeenLastCalledWith({
            schoolId: 'school-1',
            courseId: 'course-1',
            page: 2,
            limit: 8,
        });
        expect(state.participantsCurrentPage.value).toBe(2);
        expect(state.participants.value).toEqual(secondPage.items);

        await state.loadPreviousParticipantsPage();

        expect(fetchStudentsList).toHaveBeenLastCalledWith({
            schoolId: 'school-1',
            courseId: 'course-1',
            page: 1,
            limit: 8,
        });
        expect(state.participantsCurrentPage.value).toBe(1);
        expect(state.participants.value).toEqual(firstPage.items);
    });

    it('does not request pages outside the available range', async () => {
        const fetchStudentsList = vi
            .fn()
            .mockResolvedValueOnce(page())
            .mockResolvedValueOnce(page({ page: 2 }));

        const state = useManagerCourseParticipants({
            course: ref<CourseDetail | null>(course()),
            effectiveSchoolId: ref('school-1'),
            fetchStudentsList,
        });

        await flushReactiveJobs();

        await state.loadPreviousParticipantsPage();

        expect(fetchStudentsList).toHaveBeenCalledTimes(1);

        await state.loadNextParticipantsPage();
        await state.loadNextParticipantsPage();

        expect(fetchStudentsList).toHaveBeenCalledTimes(2);
        expect(fetchStudentsList).toHaveBeenLastCalledWith({
            schoolId: 'school-1',
            courseId: 'course-1',
            page: 2,
            limit: 8,
        });
    });

    it('clears data when course or school is missing', async () => {
        const fetchStudentsList = vi.fn().mockResolvedValue(page());
        const courseRef = ref<CourseDetail | null>(course());
        const schoolId = ref('school-1');

        const state = useManagerCourseParticipants({
            course: courseRef,
            effectiveSchoolId: schoolId,
            fetchStudentsList,
        });

        await flushReactiveJobs();

        courseRef.value = null;
        await flushReactiveJobs();

        expect(state.participants.value).toEqual([]);
        expect(state.participantsCurrentPage.value).toBe(1);
        expect(state.participantsPagination.value).toBeNull();
        expect(state.participantsTotal.value).toBeNull();
    });

    it('resets participant pagination when course changes', async () => {
        const firstCourseFirstPage = page({
            items: [student({ id: 'student-1', userId: 'user-1' })],
            page: 1,
        });
        const firstCourseSecondPage = page({
            items: [student({ id: 'student-2', userId: 'user-2' })],
            page: 2,
        });
        const secondCourseFirstPage = page({
            items: [student({ id: 'student-3', userId: 'user-3' })],
            page: 1,
        });
        const fetchStudentsList = vi
            .fn()
            .mockResolvedValueOnce(firstCourseFirstPage)
            .mockResolvedValueOnce(firstCourseSecondPage)
            .mockResolvedValueOnce(secondCourseFirstPage);
        const courseRef = ref<CourseDetail | null>(course({ id: 'course-1' }));

        const state = useManagerCourseParticipants({
            course: courseRef,
            effectiveSchoolId: ref('school-1'),
            fetchStudentsList,
        });

        await flushReactiveJobs();
        await state.loadNextParticipantsPage();

        courseRef.value = course({ id: 'course-2' });
        await flushReactiveJobs();

        expect(fetchStudentsList).toHaveBeenLastCalledWith({
            schoolId: 'school-1',
            courseId: 'course-2',
            page: 1,
            limit: 8,
        });
        expect(state.participantsCurrentPage.value).toBe(1);
        expect(state.participants.value).toEqual(secondCourseFirstPage.items);
    });

    it('stores a user-facing error on load failure', async () => {
        const fetchStudentsList = vi
            .fn()
            .mockRejectedValue(new Error('API down'));

        const state = useManagerCourseParticipants({
            course: ref<CourseDetail | null>(course()),
            effectiveSchoolId: ref('school-1'),
            fetchStudentsList,
        });

        await flushReactiveJobs();

        expect(state.participants.value).toEqual([]);
        expect(state.participantsTotal.value).toBeNull();
        expect(state.participantsLoadError.value).toBe('API down');
    });
});
