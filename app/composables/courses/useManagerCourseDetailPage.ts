import type { RouteLocationRaw } from 'vue-router';
import type { InstructorListItem } from '~/types/instructors/instructor';
import {
    instructorHasCourseCategoryQualification,
    resolveInstructorProfileIdForCourseSelection,
} from '~/types/instructors/instructor';
import {
    formatCourseKindLabel,
    type CourseDetail,
} from '~/types/courses/course';
import { getApiFetchErrorMessage } from '~/utils/api/apiFetchErrorMessage';
import {
    buildCourseOverviewItems,
    buildCourseRelatedItems,
    formatCourseInstructorName,
    getRouteIdString,
    readSchoolIdFromQuery,
    resolveCourseDetailError,
} from '~/utils/courses/managerCourseDetailPage';
import { usePageMeta } from '../core/usePageMeta';

export const MANAGER_COURSE_NO_INSTRUCTOR_VALUE = '__no_instructor__';

export interface ManagerCourseInfoItem {
    label: string;
    description: string;
    badge: string;
    tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}

export function useManagerCourseDetailPage() {
    const route = useRoute();
    const { addToast } = useAppToast();
    const { fetchById, isDetailLoading, patchCourse, isPatchLoading } =
        useCoursesApi();
    const { fetchList: fetchInstructorsList } = useInstructorsApi();

    const course = ref<CourseDetail | null>(null);
    const loadError = shallowRef<string | null>(null);
    let fetchSeq = 0;

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

    const schoolIdFromQuery = computed(() => {
        return readSchoolIdFromQuery(route.query.schoolId);
    });

    const effectiveSchoolId = computed(() => {
        const q = schoolIdFromQuery.value;

        if (q.length > 0) {
            return q;
        }

        const sid = course.value?.schoolId?.trim();

        return sid && sid.length > 0 ? sid : '';
    });

    const backToCoursesHref = computed<RouteLocationRaw>(() => {
        if (!effectiveSchoolId.value) {
            return '/manager/courses';
        }

        return {
            path: '/manager/courses',
            query: { schoolId: effectiveSchoolId.value },
        };
    });

    const createCourseTarget = computed<RouteLocationRaw>(() => ({
        path: '/manager/courses/new',
        query: effectiveSchoolId.value
            ? { schoolId: effectiveSchoolId.value }
            : {},
    }));

    const courseTitle = computed(
        () => course.value?.name?.trim() || 'Szczeg�y kursu',
    );

    const courseCategoryLabel = computed(() => {
        const category = course.value?.courseType?.name?.trim();

        if (category) {
            return category;
        }

        return course.value?.category?.trim() || '--';
    });

    const courseSubtitle = computed(() => {
        if (!course.value) {
            return 'Parametry kursu, kursanci, godziny i ustawienia.';
        }

        return `Kategoria ${courseCategoryLabel.value} - aktywny kurs`;
    });

    const courseInitials = computed(() => {
        const source =
            course.value?.name?.trim() || course.value?.category || 'K';
        const initials = source
            .split(/\s+/)
            .filter((part) => part.length > 0)
            .slice(0, 2)
            .map((part) => part.charAt(0))
            .join('');

        return initials.length > 0 ? initials.toUpperCase() : 'K';
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

    const overviewItems = computed<ManagerCourseInfoItem[]>(() => {
        if (!course.value) {
            return [];
        }

        return buildCourseOverviewItems(course.value);
    });

    const relatedItems = computed<ManagerCourseInfoItem[]>(() => {
        if (!course.value) {
            return [];
        }

        return buildCourseRelatedItems({
            course: course.value,
            courseCategoryLabel: courseCategoryLabel.value,
            effectiveSchoolId: effectiveSchoolId.value,
        });
    });

    usePageMeta({
        title: () => courseTitle.value,
        description: () => 'Dane kursu i przypisanie instruktora.',
    });

    function formatInstructorName(c: CourseDetail): string {
        return formatCourseInstructorName(c);
    }

    function applySelectionFromCourse() {
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

    async function loadInstructors(schoolId: string) {
        instructorsLoadError.value = null;
        isInstructorsLoading.value = true;

        try {
            instructors.value = await fetchInstructorsList(schoolId);
        } catch (e) {
            instructors.value = [];
            instructorsLoadError.value = getApiFetchErrorMessage(
                e,
                'Nie uda�o si� pobra� listy instruktor�w.',
            );
        } finally {
            isInstructorsLoading.value = false;
        }

        if (!isInstructorSelectionTouched.value) {
            applySelectionFromCourse();
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

    async function loadCourse(rawId: unknown) {
        loadError.value = null;

        const id = getRouteIdString(rawId);

        if (!id) {
            course.value = null;
            loadError.value = 'Nie znaleziono kursu.';

            return;
        }

        const seq = ++fetchSeq;

        course.value = null;
        isInstructorSelectionTouched.value = false;
        selectedInstructorProfileId.value = MANAGER_COURSE_NO_INSTRUCTOR_VALUE;

        try {
            const data = await fetchById(id);

            if (seq !== fetchSeq) {
                return;
            }

            course.value = data;
            applySelectionFromCourse();
        } catch (err: unknown) {
            if (seq !== fetchSeq) {
                return;
            }

            course.value = null;
            loadError.value = resolveCourseDetailError(err);
        }
    }

    watch(
        () => route.params.id,
        async (id) => {
            await loadCourse(id);
        },
        { immediate: true },
    );

    function handleInstructorSelectChange() {
        isInstructorSelectionTouched.value = true;
    }

    const instructorSaveBlockedReason = computed(() => {
        if (!effectiveSchoolId.value) {
            return 'Brak identyfikatora szko�y. Otw�rz szczeg�y z listy kurs�w albo dodaj parametr schoolId w adresie.';
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
        const id = getRouteIdString(route.params.id);

        if (!id || !course.value || !canSaveInstructorAssignment.value) {
            return;
        }

        const trimmed = selectedInstructorPatchValue.value;

        try {
            const updated = await patchCourse(id, {
                instructorId: trimmed.length > 0 ? trimmed : null,
            });

            course.value = updated;
            isInstructorSelectionTouched.value = false;
            applySelectionFromCourse();

            addToast({
                title: 'Instruktor zaktualizowany',
                variant: 'success',
            });
        } catch (err) {
            addToast({
                title: 'B��d',
                description: getApiFetchErrorMessage(
                    err,
                    'Nie uda�o si� zapisa� instruktora.',
                ),
                variant: 'error',
            });
        }
    }

    return {
        NO_INSTRUCTOR_VALUE: MANAGER_COURSE_NO_INSTRUCTOR_VALUE,
        route,
        course,
        loadError,
        instructors,
        instructorsLoadError,
        isInstructorsLoading,
        selectedInstructorProfileId,
        qualifiedInstructors,
        effectiveSchoolId,
        backToCoursesHref,
        createCourseTarget,
        courseTitle,
        courseCategoryLabel,
        courseSubtitle,
        courseInitials,
        overviewItems,
        relatedItems,
        isDetailLoading,
        isPatchLoading,
        instructorSaveBlockedReason,
        canSaveInstructorAssignment,
        loadCourse,
        loadInstructors,
        handleInstructorSelectChange,
        handleSaveInstructorAssignment,
        formatInstructorName,
        formatCourseKindLabel,
    };
}
