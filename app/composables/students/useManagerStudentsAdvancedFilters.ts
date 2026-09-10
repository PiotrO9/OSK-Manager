import type {
    StudentAdvancedFilter,
    StudentAdvancedFilterDraft,
} from '~~/shared/utils/studentAdvancedFilters';
import type { Ref } from 'vue';
import {
    buildStudentAdvancedFilterFromDraft,
    getDefaultStudentAdvancedFilterDraft,
    getStudentAdvancedFilterDraftFromRule,
    isDuplicateStudentAdvancedFilter,
} from '~~/shared/utils/studentAdvancedFilters';

interface UseManagerStudentsAdvancedFiltersOptions {
    advancedFilters?: Ref<StudentAdvancedFilter[]>;
}

export function useManagerStudentsAdvancedFilters(
    options: UseManagerStudentsAdvancedFiltersOptions = {},
) {
    const advancedFilters =
        options.advancedFilters ?? ref<StudentAdvancedFilter[]>([]);
    const editedFilterId = ref<string | null>(null);
    const draft = ref<StudentAdvancedFilterDraft>(
        getDefaultStudentAdvancedFilterDraft(),
    );
    const draftError = ref<string | null>(null);

    const advancedFiltersCount = computed(() => advancedFilters.value.length);
    const hasAdvancedFilters = computed(() => advancedFilters.value.length > 0);

    function startNewFilter(): void {
        editedFilterId.value = null;
        draft.value = getDefaultStudentAdvancedFilterDraft();
        draftError.value = null;
    }

    function startEditFilter(filterId: string): void {
        const filter = advancedFilters.value.find(
            (item) => item.id === filterId,
        );

        if (!filter) {
            startNewFilter();

            return;
        }

        editedFilterId.value = filterId;
        draft.value = getStudentAdvancedFilterDraftFromRule(filter);
        draftError.value = null;
    }

    function updateDraft(nextDraft: StudentAdvancedFilterDraft): void {
        draft.value = nextDraft;
        draftError.value = null;
    }

    function applyDraft(): boolean {
        const filter = buildStudentAdvancedFilterFromDraft(draft.value);

        if (!filter) {
            draftError.value = 'Uzupełnij poprawnie filtr.';

            return false;
        }

        if (advancedFilters.value.length >= 8 && !editedFilterId.value) {
            draftError.value = 'Możesz dodać maksymalnie 8 filtrów.';

            return false;
        }

        if (isDuplicateStudentAdvancedFilter(advancedFilters.value, filter)) {
            draftError.value = 'Taki filtr jest już aktywny.';

            return false;
        }

        if (editedFilterId.value) {
            advancedFilters.value = advancedFilters.value.map((item) =>
                item.id === editedFilterId.value ? filter : item,
            );
        } else {
            advancedFilters.value = [...advancedFilters.value, filter];
        }

        startNewFilter();

        return true;
    }

    function removeFilter(filterId: string): void {
        advancedFilters.value = advancedFilters.value.filter(
            (item) => item.id !== filterId,
        );

        if (editedFilterId.value === filterId) {
            startNewFilter();
        }
    }

    function clearAdvancedFilters(): void {
        advancedFilters.value = [];
        startNewFilter();
    }

    function clearConcreteCourseFilters(): void {
        advancedFilters.value = advancedFilters.value.filter(
            (filter) =>
                filter.field !== 'courseId' ||
                filter.operator === 'is_empty' ||
                filter.operator === 'is_not_empty',
        );

        if (draft.value.field === 'courseId') {
            startNewFilter();
        }
    }

    return {
        advancedFilters,
        advancedFiltersCount,
        hasAdvancedFilters,
        editedFilterId,
        draft,
        draftError,
        startNewFilter,
        startEditFilter,
        updateDraft,
        applyDraft,
        removeFilter,
        clearAdvancedFilters,
        clearConcreteCourseFilters,
    };
}
