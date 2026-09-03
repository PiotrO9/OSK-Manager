import type { Ref } from 'vue';
import type {
    CourseDetail,
    CoursePatchInstructorPayload,
} from '~/types/courses/course';
import type { InstructorListItem } from '~/types/instructors/instructor';
import {
    instructorHasCourseCategoryQualification,
    resolveInstructorProfileIdForCourseSelection,
} from '~/types/instructors/instructor';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import { getRouteIdString } from '~/utils/courses/managerCourseDetailPage';

export const MANAGER_COURSE_NO_INSTRUCTOR_VALUE = '__no_instructor__';

interface CourseInstructorAssignmentToast {
    title: string;
    description?: string;
    variant: 'success' | 'error';
}

interface UseManagerCourseInstructorAssignmentOptions {
    course: Ref<CourseDetail | null>;
    effectiveSchoolId: Readonly<Ref<string>>;
    isPatchLoading: Readonly<Ref<boolean>>;
    getRouteCourseId: () => unknown;
    fetchInstructorsList: (schoolId: string) => Promise<InstructorListItem[]>;
    patchCourse: (
        id: string,
        payload: CoursePatchInstructorPayload,
    ) => Promise<CourseDetail>;
    addToast: (toast: CourseInstructorAssignmentToast) => void;
}

export function useManagerCourseInstructorAssignment({
    course,
    effectiveSchoolId,
    isPatchLoading,
    getRouteCourseId,
    fetchInstructorsList,
    patchCourse,
    addToast,
}: UseManagerCourseInstructorAssignmentOptions) {
    const instructors = ref<InstructorListItem[]>([]);
    const instructorsLoadError = shallowRef<string | null>(null);
    const isInstructorsLoading = shallowRef(false);

    const selectedInstructorProfileId = shallowRef(
        MANAGER_COURSE_NO_INSTRUCTOR_VALUE,
    );
    const isInstructorSelectionTouched = shallowRef(false);

    const qualifiedInstructors = computed((): InstructorListItem[] => {
        const categoryCode =
            course.value?.courseType?.code?.trim() ||
            course.value?.category ||
            '';

        if (!categoryCode.trim()) {
            return [];
        }

        return instructors.value.filter((instructor) =>
            instructorHasCourseCategoryQualification(instructor, categoryCode),
        );
    });

    const resolvedInstructorProfileIdFromCourse = computed(() => {
        if (!course.value) {
            return '';
        }

        return resolveInstructorProfileIdForCourseSelection(
            course.value.instructor,
            qualifiedInstructors.value,
        );
    });

    const selectedInstructorPatchValue = computed(() => {
        const value = selectedInstructorProfileId.value.trim();

        return value === MANAGER_COURSE_NO_INSTRUCTOR_VALUE ? '' : value;
    });

    function syncInstructorSelectionFromCourse() {
        if (!course.value) {
            selectedInstructorProfileId.value =
                MANAGER_COURSE_NO_INSTRUCTOR_VALUE;

            return;
        }

        const resolved = resolveInstructorProfileIdForCourseSelection(
            course.value.instructor,
            qualifiedInstructors.value,
        );

        selectedInstructorProfileId.value =
            resolved.length > 0 ? resolved : MANAGER_COURSE_NO_INSTRUCTOR_VALUE;
    }

    function resetInstructorSelection() {
        isInstructorSelectionTouched.value = false;
        selectedInstructorProfileId.value = MANAGER_COURSE_NO_INSTRUCTOR_VALUE;
    }

    async function loadInstructors(schoolId: string) {
        instructorsLoadError.value = null;
        isInstructorsLoading.value = true;

        try {
            instructors.value = await fetchInstructorsList(schoolId);
        } catch (e) {
            instructors.value = [];
            instructorsLoadError.value = getApiFetchErrorMessage(
                e,
                'Nie udało się pobrać listy instruktorów.',
            );
        } finally {
            isInstructorsLoading.value = false;
        }

        if (!isInstructorSelectionTouched.value) {
            syncInstructorSelectionFromCourse();
        }
    }

    watch(
        effectiveSchoolId,
        (sid) => {
            if (!sid) {
                instructors.value = [];
                instructorsLoadError.value = null;

                return;
            }

            void loadInstructors(sid);
        },
        { immediate: true },
    );

    function handleInstructorSelectChange() {
        isInstructorSelectionTouched.value = true;
    }

    const instructorSaveBlockedReason = computed(() => {
        if (!effectiveSchoolId.value) {
            return 'Brak identyfikatora szkoły. Otwórz szczegóły z listy kursów albo dodaj parametr schoolId w adresie.';
        }

        return '';
    });

    const canSaveInstructorAssignment = computed(() => {
        if (!course.value || instructorSaveBlockedReason.value.length > 0) {
            return false;
        }

        if (isPatchLoading.value || isInstructorsLoading.value) {
            return false;
        }

        const sel = selectedInstructorPatchValue.value;
        const cur = resolvedInstructorProfileIdFromCourse.value.trim();

        return sel !== cur;
    });

    async function handleSaveInstructorAssignment() {
        const id = getRouteIdString(getRouteCourseId());

        if (!id || !course.value || !canSaveInstructorAssignment.value) {
            return;
        }

        const trimmed = selectedInstructorPatchValue.value;

        try {
            const updated = await patchCourse(id, {
                instructorId: trimmed.length > 0 ? trimmed : null,
            });

            course.value = updated;
            resetInstructorSelection();
            syncInstructorSelectionFromCourse();

            addToast({
                title: 'Instruktor zaktualizowany',
                variant: 'success',
            });
        } catch (err) {
            addToast({
                title: 'Błąd',
                description: getApiFetchErrorMessage(
                    err,
                    'Nie udało się zapisać instruktora.',
                ),
                variant: 'error',
            });
        }
    }

    return {
        instructors,
        instructorsLoadError,
        isInstructorsLoading,
        selectedInstructorProfileId,
        qualifiedInstructors,
        instructorSaveBlockedReason,
        canSaveInstructorAssignment,
        loadInstructors,
        resetInstructorSelection,
        syncInstructorSelectionFromCourse,
        handleInstructorSelectChange,
        handleSaveInstructorAssignment,
    };
}
