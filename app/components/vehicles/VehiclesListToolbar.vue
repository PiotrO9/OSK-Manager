<script setup lang="ts">
import { Building2, Search, X } from 'lucide-vue-next';
import type { VehiclesListPanelId } from '~/composables/vehicles/useVehiclesListPage';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { VehicleStatusFilter } from '~/utils/vehicles/filters';

const props = defineProps<{
    isManager: boolean;
    schools: DrivingSchool[];
    selectedSchoolId: string | null;
    selectedSchoolName: string;
    isSchoolsLoading: boolean;
    searchTerm: string;
    statusFilter: VehicleStatusFilter;
    activePanel: VehiclesListPanelId;
    resultsLabel: string;
    hasActiveFilters: boolean;
}>();

const emit = defineEmits<{
    schoolChange: [schoolId: string];
    searchChange: [value: string];
    statusFilterChange: [value: VehicleStatusFilter];
    clearFilters: [];
    tabSelect: [panel: VehiclesListPanelId];
}>();

const selectedSchoolModel = computed({
    get: () => props.selectedSchoolId ?? '',
    set: (value: string) => emit('schoolChange', value),
});

const searchModel = computed({
    get: () => props.searchTerm,
    set: (value: string) => emit('searchChange', value),
});

const statusModel = computed({
    get: () => props.statusFilter,
    set: (value: VehicleStatusFilter) => emit('statusFilterChange', value),
});
</script>

<template>
    <div class="border-border space-y-4 border-b px-4 py-4 sm:px-5">
        <div
            class="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
            <div
                v-if="isManager && schools.length > 1"
                class="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3 lg:max-w-md lg:flex-1"
            >
                <UiLabel
                    for="vehicles-school"
                    class="text-muted-foreground shrink-0 text-xs"
                >
                    Szkoła jazdy
                </UiLabel>
                <UiSelect
                    v-model="selectedSchoolModel"
                    :disabled="isSchoolsLoading"
                >
                    <UiSelectTrigger
                        id="vehicles-school"
                        class="!h-11 w-full min-w-0 sm:!h-10"
                    >
                        <UiSelectValue placeholder="Wybierz OSK" />
                    </UiSelectTrigger>
                    <UiSelectContent>
                        <UiSelectItem
                            v-for="school in schools"
                            :key="school.id"
                            :value="school.id"
                        >
                            {{ school.name
                            }}{{ school.city ? ` (${school.city})` : '' }}
                        </UiSelectItem>
                    </UiSelectContent>
                </UiSelect>
            </div>
            <div v-else class="flex min-w-0 items-center gap-3">
                <span
                    class="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md"
                    aria-hidden="true"
                >
                    <Building2 class="size-4" />
                </span>
                <div class="min-w-0">
                    <p class="text-muted-foreground text-xs">Szkoła jazdy</p>
                    <p class="text-foreground truncate text-sm font-semibold">
                        {{ selectedSchoolName }}
                    </p>
                </div>
            </div>

            <VehiclesListModeTabs
                v-if="isManager"
                :active-panel="activePanel"
                @tab-select="emit('tabSelect', $event)"
            />
        </div>

        <div class="flex flex-col gap-3 md:flex-row md:items-center">
            <div
                class="relative min-w-0 flex-1 md:max-w-xl"
                role="search"
                aria-label="Wyszukiwanie pojazdów"
            >
                <Search
                    class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                    aria-hidden="true"
                />
                <UiInput
                    v-model="searchModel"
                    type="search"
                    name="vehicle-search"
                    maxlength="120"
                    autocomplete="off"
                    spellcheck="false"
                    class="h-11 pr-11 pl-9 sm:h-10"
                    placeholder="Szukaj po nazwie lub rejestracji…"
                    aria-label="Szukaj po nazwie pojazdu lub numerze rejestracyjnym"
                />
                <UiButton
                    v-if="searchTerm"
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="absolute top-0 right-0 size-11 sm:size-10"
                    aria-label="Wyczyść wyszukiwanie"
                    title="Wyczyść wyszukiwanie"
                    @click="emit('searchChange', '')"
                >
                    <X class="size-4" aria-hidden="true" />
                </UiButton>
            </div>

            <UiSelect v-model="statusModel">
                <UiSelectTrigger
                    class="!h-11 w-full md:!h-10 md:w-52"
                    aria-label="Filtr dostępności pojazdu"
                >
                    <UiSelectValue />
                </UiSelectTrigger>
                <UiSelectContent>
                    <UiSelectItem value="all">Wszystkie statusy</UiSelectItem>
                    <UiSelectItem value="ACTIVE">Dostępne</UiSelectItem>
                    <UiSelectItem value="UNAVAILABLE">Niedostępne</UiSelectItem>
                </UiSelectContent>
            </UiSelect>

            <UiButton
                v-if="hasActiveFilters"
                type="button"
                variant="ghost"
                size="sm"
                class="text-muted-foreground h-11 gap-1.5 text-xs sm:h-8"
                @click="emit('clearFilters')"
            >
                <X class="size-3.5" aria-hidden="true" />
                Wyczyść filtry
            </UiButton>

            <p
                class="text-muted-foreground text-sm font-semibold tabular-nums md:ml-auto"
                role="status"
                aria-live="polite"
            >
                {{ resultsLabel }}
            </p>
        </div>
    </div>
</template>
