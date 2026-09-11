import type { Ref } from 'vue';
import type {
    InstructorAdvancedFilter,
    InstructorAdvancedFilterDraft,
} from '~~/shared/utils/instructorAdvancedFilters';
import {
    buildInstructorAdvancedFilterFromDraft,
    getDefaultInstructorAdvancedFilterDraft,
    getInstructorAdvancedFilterDraftFromRule,
    instructorAdvancedFilterMaxCount,
    isDuplicateInstructorAdvancedFilter,
} from '~~/shared/utils/instructorAdvancedFilters';

interface UseManagerInstructorsAdvancedFiltersOptions {
    advancedFilters?: Ref<InstructorAdvancedFilter[]>;
}

export function useManagerInstructorsAdvancedFilters(
    options: UseManagerInstructorsAdvancedFiltersOptions = {},
) {
    const advancedFilters =
        options.advancedFilters ?? ref<InstructorAdvancedFilter[]>([]);
    const editedFilterId = ref<string | null>(null);
    const draft = ref<InstructorAdvancedFilterDraft>(
        getDefaultInstructorAdvancedFilterDraft(),
    );
    const draftError = ref<string | null>(null);

    const advancedFiltersCount = computed(() => advancedFilters.value.length);
    const hasAdvancedFilters = computed(() => advancedFilters.value.length > 0);

    function startNewFilter(): void {
        editedFilterId.value = null;
        draft.value = getDefaultInstructorAdvancedFilterDraft();
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
        draft.value = getInstructorAdvancedFilterDraftFromRule(filter);
        draftError.value = null;
    }

    function updateDraft(nextDraft: InstructorAdvancedFilterDraft): void {
        draft.value = nextDraft;
        draftError.value = null;
    }

    function applyDraft(): boolean {
        const filter = buildInstructorAdvancedFilterFromDraft(draft.value);

        if (!filter) {
            draftError.value = 'Uzupełnij poprawnie filtr.';

            return false;
        }

        if (
            advancedFilters.value.length >= instructorAdvancedFilterMaxCount &&
            !editedFilterId.value
        ) {
            draftError.value = 'Możesz dodać maksymalnie 8 filtrów.';

            return false;
        }

        if (
            isDuplicateInstructorAdvancedFilter(advancedFilters.value, filter)
        ) {
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
    };
}
