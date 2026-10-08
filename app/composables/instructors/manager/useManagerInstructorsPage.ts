import { useManagerInstructorsAdvancedFilters } from './useManagerInstructorsAdvancedFilters';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { InstructorListItem } from '~/types/instructors/instructor';
import { useManagerInstructorSchoolSelection } from './useManagerInstructorSchoolSelection';
import {
    buildInstructorDetailsRoute,
    filterInstructorsForList,
    formatQualificationFilterLabel,
    formatVisibleInstructorsLabel,
    getInstructorQualificationOptions,
    type InstructorQuickView,
    instructorInitials,
    instructorQualificationLabel,
    resolveInstructorsListError,
} from '~/utils/instructors/managerInstructorsPage';

export function useManagerInstructorsPage() {
    const { fetchList: fetchSchoolsList } = useDrivingSchoolsApi();
    const { fetchList: fetchInstructorsList } = useInstructorsApi();
    const { activeSchoolId } = useManagerInstructorSchoolSelection();

    const schools = ref<DrivingSchool[]>([]);
    const schoolsLoadError = ref<string | null>(null);
    const isSchoolsLoading = ref(false);

    const instructors = ref<InstructorListItem[]>([]);
    const isInstructorsLoading = ref(false);
    const instructorsLoadError = ref<string | null>(null);
    const search = ref('');
    const quickView = ref<InstructorQuickView>('all');
    const advancedFilterState = useManagerInstructorsAdvancedFilters();

    let schoolsLoadSequence = 0;
    let instructorsLoadSequence = 0;

    const activeSchool = computed(
        () =>
            schools.value.find(
                (school) => school.id === activeSchoolId.value,
            ) ?? null,
    );

    const visibleInstructors = computed(() =>
        filterInstructorsForList(
            instructors.value,
            search.value,
            quickView.value,
            advancedFilterState.advancedFilters.value,
        ),
    );

    const qualificationOptions = computed(() =>
        getInstructorQualificationOptions(instructors.value),
    );

    const instructorsWithQualificationsCount = computed(
        () =>
            visibleInstructors.value.filter(
                (instructor) =>
                    (instructor.qualifiedCourseTypes ?? []).length > 0,
            ).length,
    );

    const uniqueQualificationCodesCount = computed(() => {
        const codes = new Set<string>();

        for (const instructor of visibleInstructors.value) {
            for (const courseType of instructor.qualifiedCourseTypes ?? []) {
                const code = courseType.code.trim();

                if (code.length > 0) {
                    codes.add(code);
                }
            }
        }

        return codes.size;
    });

    const visibleInstructorsLabel = computed(() =>
        formatVisibleInstructorsLabel(visibleInstructors.value.length),
    );

    const qualificationFilterLabel = computed(() =>
        formatQualificationFilterLabel(
            uniqueQualificationCodesCount.value,
            quickView.value,
        ),
    );

    const hasInstructorFilters = computed(
        () =>
            search.value.trim().length > 0 ||
            quickView.value !== 'all' ||
            advancedFilterState.hasAdvancedFilters.value,
    );

    function clearInstructorFilters() {
        search.value = '';
        quickView.value = 'all';
        advancedFilterState.clearAdvancedFilters();
    }

    function resolveInitialActiveSchoolId(): string {
        const selectedSchool = schools.value.find(
            (school) => school.id === activeSchoolId.value,
        );

        return selectedSchool?.id ?? schools.value[0]?.id ?? '';
    }

    async function loadSchools() {
        const requestSequence = ++schoolsLoadSequence;

        schoolsLoadError.value = null;
        isSchoolsLoading.value = true;

        try {
            const items = await fetchSchoolsList();

            if (requestSequence !== schoolsLoadSequence) {
                return;
            }

            schools.value = items;
        } catch (error) {
            if (requestSequence !== schoolsLoadSequence) {
                return;
            }

            schoolsLoadError.value =
                error instanceof Error
                    ? error.message
                    : 'Nie udało się pobrać listy OSK.';
        } finally {
            if (requestSequence === schoolsLoadSequence) {
                isSchoolsLoading.value = false;
            }
        }
    }

    async function loadInstructors() {
        const schoolId = activeSchoolId.value.trim();
        const requestSequence = ++instructorsLoadSequence;

        if (!schoolId) {
            instructors.value = [];

            return;
        }

        instructorsLoadError.value = null;
        isInstructorsLoading.value = true;

        try {
            const items = await fetchInstructorsList(schoolId);

            if (requestSequence !== instructorsLoadSequence) {
                return;
            }

            instructors.value = items;
        } catch (err) {
            if (requestSequence !== instructorsLoadSequence) {
                return;
            }

            instructors.value = [];
            instructorsLoadError.value = resolveInstructorsListError(err);
        } finally {
            if (requestSequence === instructorsLoadSequence) {
                isInstructorsLoading.value = false;
            }
        }
    }

    async function handleActiveSchoolChange() {
        instructorsLoadError.value = null;
        await loadInstructors();
    }

    onMounted(async () => {
        await loadSchools();
        activeSchoolId.value = resolveInitialActiveSchoolId();

        if (activeSchoolId.value) {
            await loadInstructors();
        }
    });

    function instructorDetailsTo(instructor: InstructorListItem) {
        return buildInstructorDetailsRoute(instructor, activeSchoolId.value);
    }

    function handleOpenCreatePage() {
        void navigateTo('/manager/instructors/new');
    }

    return {
        schools,
        schoolsLoadError,
        isSchoolsLoading,
        activeSchoolId,
        activeSchool,
        instructors,
        search,
        quickView,
        advancedFilters: advancedFilterState.advancedFilters,
        advancedFiltersCount: advancedFilterState.advancedFiltersCount,
        hasAdvancedFilters: advancedFilterState.hasAdvancedFilters,
        advancedFilterDraft: advancedFilterState.draft,
        advancedFilterDraftError: advancedFilterState.draftError,
        qualificationOptions,
        visibleInstructors,
        isInstructorsLoading,
        instructorsLoadError,
        instructorsWithQualificationsCount,
        uniqueQualificationCodesCount,
        visibleInstructorsLabel,
        qualificationFilterLabel,
        hasInstructorFilters,
        clearInstructorFilters,
        startNewAdvancedFilter: advancedFilterState.startNewFilter,
        startEditAdvancedFilter: advancedFilterState.startEditFilter,
        updateAdvancedFilterDraft: advancedFilterState.updateDraft,
        applyAdvancedFilterDraft: advancedFilterState.applyDraft,
        cancelAdvancedFilterDraft: advancedFilterState.startNewFilter,
        removeAdvancedFilter: advancedFilterState.removeFilter,
        clearAdvancedFilters: advancedFilterState.clearAdvancedFilters,
        loadSchools,
        loadInstructors,
        handleActiveSchoolChange,
        instructorDetailsTo,
        instructorQualificationLabel,
        instructorInitials,
        handleOpenCreatePage,
    };
}
