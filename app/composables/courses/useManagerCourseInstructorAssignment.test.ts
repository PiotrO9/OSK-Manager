import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, nextTick, ref, shallowRef, watch } from 'vue';
import type { CourseDetail } from '~/types/courses/course';
import type { InstructorListItem } from '~/types/instructors/instructor';

import {
    MANAGER_COURSE_NO_INSTRUCTOR_VALUE,
    useManagerCourseInstructorAssignment,
} from './useManagerCourseInstructorAssignment';

function installVueGlobals() {
    vi.stubGlobal('ref', ref);
    vi.stubGlobal('shallowRef', shallowRef);
    vi.stubGlobal('computed', computed);
    vi.stubGlobal('watch', watch);
}

async function flushReactiveJobs() {
    await nextTick();
    await Promise.resolve();
    await nextTick();
}

function instructor(
    overrides: Partial<InstructorListItem> = {},
): InstructorListItem {
    return {
        id: 'profile-1',
        userId: 'user-1',
        firstName: 'Anna',
        lastName: 'Nowak',
        email: 'anna@example.test',
        qualifiedCourseTypes: [
            { id: 'type-b', code: 'B', name: 'Kategoria B' },
        ],
        ...overrides,
    };
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

function setupAssignment(
    options: {
        course?: CourseDetail | null;
        schoolId?: string;
        routeCourseId?: unknown;
        isPatchLoading?: boolean;
        fetchInstructorsList?: (
            schoolId: string,
        ) => Promise<InstructorListItem[]>;
        patchCourse?: (
            id: string,
            payload: { instructorId: string | null },
        ) => Promise<CourseDetail>;
    } = {},
) {
    const courseRef = ref<CourseDetail | null>(options.course ?? null);
    const effectiveSchoolId = ref(options.schoolId ?? '');
    const isPatchLoading = ref(options.isPatchLoading ?? false);
    const fetchInstructorsList =
        options.fetchInstructorsList ?? vi.fn().mockResolvedValue([]);
    const patchCourse =
        options.patchCourse ?? vi.fn().mockResolvedValue(course());
    const addToast = vi.fn();

    const assignment = useManagerCourseInstructorAssignment({
        course: courseRef,
        effectiveSchoolId,
        isPatchLoading,
        getRouteCourseId: () => options.routeCourseId ?? 'course-1',
        fetchInstructorsList,
        patchCourse,
        addToast,
    });

    return {
        assignment,
        courseRef,
        effectiveSchoolId,
        isPatchLoading,
        fetchInstructorsList,
        patchCourse,
        addToast,
    };
}

describe('useManagerCourseInstructorAssignment', () => {
    beforeEach(() => {
        installVueGlobals();
    });

    it('loads instructors and selects current course instructor when untouched', async () => {
        const matchingInstructor = instructor();
        const { assignment, fetchInstructorsList } = setupAssignment({
            course: course({
                instructor: { id: 'user-1', name: 'Anna Nowak' },
            }),
            fetchInstructorsList: vi.fn().mockResolvedValue([
                matchingInstructor,
                instructor({
                    id: 'profile-2',
                    userId: 'user-2',
                    qualifiedCourseTypes: [
                        {
                            id: 'type-a',
                            code: 'A',
                            name: 'Kategoria A',
                        },
                    ],
                }),
            ]),
        });

        await assignment.loadInstructors('school-1');

        expect(fetchInstructorsList).toHaveBeenCalledWith('school-1');
        expect(assignment.instructors.value).toEqual([
            matchingInstructor,
            instructor({
                id: 'profile-2',
                userId: 'user-2',
                qualifiedCourseTypes: [
                    {
                        id: 'type-a',
                        code: 'A',
                        name: 'Kategoria A',
                    },
                ],
            }),
        ]);
        expect(assignment.qualifiedInstructors.value).toEqual([
            matchingInstructor,
        ]);
        expect(assignment.selectedInstructorProfileId.value).toBe('profile-1');
    });

    it('clears instructors and load error when effective school id becomes empty', async () => {
        const { assignment, effectiveSchoolId } = setupAssignment({
            schoolId: 'school-1',
        });

        await flushReactiveJobs();

        assignment.instructors.value = [instructor()];
        assignment.instructorsLoadError.value = 'Błąd ładowania';

        effectiveSchoolId.value = '';
        await flushReactiveJobs();

        expect(assignment.instructors.value).toEqual([]);
        expect(assignment.instructorsLoadError.value).toBeNull();
    });

    it('blocks save when school id is missing, patch is loading, or selection is unchanged', async () => {
        const { assignment } = setupAssignment({
            course: course(),
            schoolId: '',
        });

        expect(assignment.instructorSaveBlockedReason.value).toContain(
            'Brak identyfikatora szkoły',
        );
        expect(assignment.canSaveInstructorAssignment.value).toBe(false);

        const unchanged = setupAssignment({
            course: course(),
            schoolId: 'school-1',
        });

        await flushReactiveJobs();
        expect(unchanged.assignment.canSaveInstructorAssignment.value).toBe(
            false,
        );

        const loading = setupAssignment({
            course: course(),
            schoolId: 'school-1',
            isPatchLoading: true,
        });

        loading.assignment.selectedInstructorProfileId.value = 'profile-1';

        expect(loading.assignment.canSaveInstructorAssignment.value).toBe(
            false,
        );
    });

    it('saves selected instructor and syncs course state on success', async () => {
        const updated = course({
            instructor: { id: 'user-1', name: 'Anna Nowak' },
        });
        const { assignment, courseRef, patchCourse, addToast } =
            setupAssignment({
                course: course(),
                schoolId: 'school-1',
                patchCourse: vi.fn().mockResolvedValue(updated),
            });

        await flushReactiveJobs();

        assignment.instructors.value = [instructor()];
        assignment.selectedInstructorProfileId.value = 'profile-1';

        await assignment.handleSaveInstructorAssignment();

        expect(patchCourse).toHaveBeenCalledWith('course-1', {
            instructorId: 'profile-1',
        });
        expect(courseRef.value).toEqual(updated);
        expect(assignment.selectedInstructorProfileId.value).toBe('profile-1');
        expect(addToast).toHaveBeenCalledWith({
            title: 'Instruktor zaktualizowany',
            variant: 'success',
        });
    });

    it('saves null instructor when no instructor is selected', async () => {
        const { assignment, patchCourse } = setupAssignment({
            course: course({
                instructor: { id: 'user-1', name: 'Anna Nowak' },
            }),
            schoolId: 'school-1',
            patchCourse: vi.fn().mockResolvedValue(course()),
        });

        await flushReactiveJobs();

        assignment.instructors.value = [instructor()];
        assignment.syncInstructorSelectionFromCourse();
        assignment.selectedInstructorProfileId.value =
            MANAGER_COURSE_NO_INSTRUCTOR_VALUE;

        await assignment.handleSaveInstructorAssignment();

        expect(patchCourse).toHaveBeenCalledWith('course-1', {
            instructorId: null,
        });
    });

    it('shows error toast when instructor save fails', async () => {
        const { assignment, addToast } = setupAssignment({
            course: course(),
            schoolId: 'school-1',
            patchCourse: vi.fn().mockRejectedValue(new Error('API down')),
        });

        await flushReactiveJobs();

        assignment.selectedInstructorProfileId.value = 'profile-1';

        await assignment.handleSaveInstructorAssignment();

        expect(addToast).toHaveBeenCalledWith({
            title: 'Błąd',
            description: 'API down',
            variant: 'error',
        });
    });

    it('resets instructor selection to untouched empty value', () => {
        const { assignment } = setupAssignment();

        assignment.selectedInstructorProfileId.value = 'profile-1';
        assignment.handleInstructorSelectChange();

        assignment.resetInstructorSelection();

        expect(assignment.selectedInstructorProfileId.value).toBe(
            MANAGER_COURSE_NO_INSTRUCTOR_VALUE,
        );
    });
});
