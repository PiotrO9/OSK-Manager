<script setup lang="ts">
import { RefreshCw, Search, X } from '@lucide/vue';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type {
    SecurityLogDetail,
    SecurityLogItem,
    SecurityLogPersonOption,
    SecurityLogsPageInfo,
} from '~/types/security-logs/securityLog';
import type {
    SecurityLogFilter,
    SecurityLogFilterDraft,
} from '~~/shared/utils/securityLogFilters';
import type { SecurityLogQuickView } from '~/composables/security-logs/useManagerSecurityLogsPage';

const props = defineProps<{
    schools: readonly DrivingSchool[];
    schoolId: string;
    activeSchool: DrivingSchool | null;
    schoolsLoading: boolean;
    schoolsError: string;
    items: readonly SecurityLogItem[];
    pageInfo: SecurityLogsPageInfo;
    collectionStatus: 'OK' | 'DEGRADED' | 'UNKNOWN';
    loading: boolean;
    error: string;
    search: string;
    quickView: SecurityLogQuickView;
    filters: readonly SecurityLogFilter[];
    draft: SecurityLogFilterDraft;
    draftError: string;
    selectedEventId: string;
    detail: SecurityLogDetail | null;
    detailLoading: boolean;
    detailError: string;
    personOptions: SecurityLogPersonOption[];
    personOptionsLoading: boolean;
}>();
const emit = defineEmits<{
    reloadSchools: [];
    refresh: [];
    schoolChange: [value: string];
    searchChange: [value: string];
    viewChange: [value: SecurityLogQuickView];
    clearFilters: [];
    startNewFilter: [];
    startEditFilter: [id: string];
    updateDraft: [draft: SecurityLogFilterDraft];
    applyDraft: [];
    removeFilter: [id: string];
    searchPeople: [value: string];
    pageOlder: [];
    pageNewer: [];
    openDetails: [id: string];
    closeDetails: [];
    retryDetails: [];
}>();
const views: { value: SecurityLogQuickView; label: string }[] = [
    { value: 'all', label: 'Wszystkie' },
    { value: 'failed-logins', label: 'Nieudane logowania' },
    { value: 'suspicious', label: 'Podejrzane próby' },
    { value: 'access-denied', label: 'Odmowy dostępu' },
    { value: 'account-changes', label: 'Zmiany kont' },
];
const hasFilters = computed(
    () =>
        props.search.trim() !== '' ||
        props.quickView !== 'all' ||
        props.filters.length > 0,
);
</script>

<template>
    <div class="space-y-6">
        <PageHeader
            title="Logi bezpieczeństwa"
            eyebrow="Manager"
            description="Historia logowania, odmów dostępu i ważnych zmian na kontach."
        >
            <template #actions
                ><UiButton
                    type="button"
                    variant="outline"
                    class="h-11 w-full gap-2 sm:h-10 sm:w-auto"
                    :disabled="loading || !schoolId"
                    @click="emit('refresh')"
                    ><RefreshCw
                        class="size-4"
                        aria-hidden="true"
                    />Odśwież</UiButton
                ></template
            >
        </PageHeader>
        <section
            class="border-border bg-card min-w-0 overflow-hidden rounded-xl border shadow-xs"
            aria-label="Dziennik zdarzeń bezpieczeństwa"
        >
            <div class="border-border border-b px-4 py-4 sm:px-5">
                <SchoolContextSelect
                    v-if="schools.length > 1"
                    id="security-logs-school"
                    :schools="schools"
                    :model-value="schoolId"
                    :disabled="schoolsLoading"
                    @update:model-value="emit('schoolChange', String($event))"
                />
                <SchoolContext
                    v-else
                    :school="activeSchool"
                    :loading="schoolsLoading"
                />
            </div>
            <ErrorState
                v-if="schoolsError"
                class="m-4"
                title="Nie udało się pobrać ośrodków"
                :description="schoolsError"
                @retry="emit('reloadSchools')"
            />
            <template v-else-if="schoolsLoading"
                ><LoadingState class="m-4" title="Wczytywanie ośrodków"
            /></template>
            <EmptyState
                v-else-if="schools.length === 0"
                class="m-4"
                title="Brak ośrodków"
                description="Nie masz jeszcze przypisanego ośrodka, którego zdarzenia można wyświetlić."
            />
            <template v-else>
                <div class="border-border space-y-4 border-b px-4 py-4 sm:px-5">
                    <div class="flex flex-wrap gap-2">
                        <div
                            class="relative min-w-0 flex-1 basis-64"
                            role="search"
                            aria-label="Wyszukiwanie zdarzeń"
                        >
                            <Search
                                class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                                aria-hidden="true"
                            />
                            <UiInput
                                :model-value="search"
                                type="search"
                                maxlength="120"
                                autocomplete="off"
                                class="h-11 pr-11 pl-9 sm:h-10"
                                placeholder="Szukaj zdarzenia lub operacji…"
                                aria-label="Szukaj zdarzenia lub operacji"
                                @update:model-value="
                                    emit('searchChange', String($event))
                                "
                            />
                            <UiButton
                                v-if="search"
                                type="button"
                                variant="ghost"
                                size="icon"
                                class="absolute top-0 right-0 size-11 sm:size-10"
                                aria-label="Wyczyść wyszukiwanie"
                                @click="emit('searchChange', '')"
                                ><X class="size-4"
                            /></UiButton>
                        </div>
                        <UiButton
                            v-if="hasFilters"
                            type="button"
                            variant="outline"
                            class="h-11 sm:h-10"
                            @click="emit('clearFilters')"
                            ><X class="size-4" aria-hidden="true" />Wyczyść
                            filtry</UiButton
                        >
                    </div>
                    <div
                        class="flex flex-wrap gap-2"
                        role="group"
                        aria-label="Szybkie filtry zdarzeń"
                    >
                        <button
                            v-for="view in views"
                            :key="view.value"
                            type="button"
                            class="focus-visible:ring-ring min-h-9 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                            :class="
                                quickView === view.value
                                    ? 'border-primary-300 bg-primary-50 text-primary-800 dark:border-primary-500/50 dark:bg-primary-500/15 dark:text-primary-200'
                                    : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                            "
                            :aria-pressed="quickView === view.value"
                            @click="emit('viewChange', view.value)"
                        >
                            {{ view.label }}
                        </button>
                    </div>
                    <ManagerSecurityLogsAdvancedFilters
                        :filters="filters"
                        :draft="draft"
                        :error="draftError"
                        :disabled="loading"
                        :person-options="personOptions"
                        :person-options-loading="personOptionsLoading"
                        @start-new="emit('startNewFilter')"
                        @start-edit="emit('startEditFilter', $event)"
                        @update-draft="emit('updateDraft', $event)"
                        @apply="emit('applyDraft')"
                        @remove="emit('removeFilter', $event)"
                        @clear="emit('clearFilters')"
                        @search-people="emit('searchPeople', $event)"
                    />
                </div>
                <div
                    class="border-border flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 text-sm sm:px-5"
                >
                    <span class="text-muted-foreground"
                        >Wyświetlono {{ items.length }} zdarzeń</span
                    ><StatusBadge
                        v-if="collectionStatus !== 'OK'"
                        :label="
                            collectionStatus === 'DEGRADED'
                                ? 'Zbieranie zdarzeń jest ograniczone'
                                : 'Stan zbierania zdarzeń nieznany'
                        "
                        tone="warning"
                        subtle
                    />
                </div>
                <LoadingState
                    v-if="loading"
                    class="m-4"
                    title="Wczytywanie logów"
                />
                <ErrorState
                    v-else-if="error"
                    class="m-4"
                    :description="error"
                    @retry="emit('refresh')"
                />
                <EmptyState
                    v-else-if="items.length === 0"
                    class="m-4"
                    :title="hasFilters ? 'Brak wyników' : 'Brak zdarzeń'"
                    :description="
                        hasFilters
                            ? 'Zmień filtry lub zakres dat.'
                            : 'W tym ośrodku nie zapisano jeszcze zdarzeń bezpieczeństwa.'
                    "
                />
                <ManagerSecurityLogsList
                    v-else
                    :items="items"
                    @open-details="emit('openDetails', $event)"
                />
                <div
                    v-if="!loading && !error && items.length"
                    class="border-border flex items-center justify-between gap-3 border-t px-4 py-3 sm:px-5"
                >
                    <UiButton
                        type="button"
                        variant="outline"
                        :disabled="!pageInfo.hasPreviousPage"
                        @click="emit('pageNewer')"
                        >Nowsze</UiButton
                    ><UiButton
                        type="button"
                        variant="outline"
                        :disabled="!pageInfo.hasNextPage"
                        @click="emit('pageOlder')"
                        >Starsze</UiButton
                    >
                </div>
            </template>
        </section>
        <ManagerSecurityLogDetailsDialog
            :open="Boolean(selectedEventId)"
            :detail="detail"
            :loading="detailLoading"
            :error="detailError"
            @close="emit('closeDetails')"
            @retry="emit('retryDetails')"
        />
    </div>
</template>
