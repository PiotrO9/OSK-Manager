<script setup lang="ts">
import type { AdvancedFilterChip } from '~~/shared/utils/advancedFilters';
import type {
    SecurityLogFilter,
    SecurityLogFilterDraft,
} from '~~/shared/utils/securityLogFilters';
import {
    securityLogFilterLabel,
    securityLogFilterSegments,
} from '~~/shared/utils/securityLogFilters';
import type { SecurityLogPersonOption } from '~/types/security-logs/securityLog';

const props = defineProps<{
    filters: readonly SecurityLogFilter[];
    draft: SecurityLogFilterDraft;
    error: string;
    disabled: boolean;
    personOptions: SecurityLogPersonOption[];
    personOptionsLoading: boolean;
}>();
const emit = defineEmits<{
    startNew: [];
    startEdit: [id: string];
    updateDraft: [draft: SecurityLogFilterDraft];
    apply: [];
    cancel: [];
    remove: [id: string];
    clear: [];
    searchPeople: [value: string];
}>();
const chips = computed<AdvancedFilterChip[]>(() =>
    props.filters.map((filter) => ({
        id: filter.id,
        label: securityLogFilterLabel(filter),
        segments: securityLogFilterSegments(filter),
    })),
);
</script>

<template>
    <AppAdvancedFilters
        :active-filters="chips"
        :editor-title="draft.id ? 'Edytuj filtr' : 'Dodaj filtr'"
        :disabled="disabled"
        :error="error"
        controls-base-id="security-log-filter"
        @start-new="emit('startNew')"
        @start-edit="emit('startEdit', $event)"
        @apply="emit('apply')"
        @cancel="emit('cancel')"
        @remove="emit('remove', $event)"
        @clear="emit('clear')"
    >
        <template #editor="{ apply, cancel }">
            <ManagerSecurityLogFilterEditor
                :draft="draft"
                :error="error"
                :disabled="disabled"
                :person-options="personOptions"
                :person-options-loading="personOptionsLoading"
                @update-draft="emit('updateDraft', $event)"
                @apply="apply"
                @cancel="cancel"
                @search-people="emit('searchPeople', $event)"
            />
        </template>
    </AppAdvancedFilters>
</template>
