<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import type { VehicleStatusUpdateBody } from '~/composables/vehicles/useVehiclesApi';
import type { VehiclesListPanelId } from '~/composables/vehicles/useVehiclesListPage';
import type { DrivingSchool } from '~/types/schools/drivingSchool';
import type { Vehicle } from '~/types/vehicles/vehicle';
import { displayVehicleText } from '~/utils/vehicles/display';
import type { VehicleStatusFilter } from '~/utils/vehicles/filters';

defineProps<{
    isManager: boolean;
    activePanel: VehiclesListPanelId;
    resolvedSchoolId: string | null;
    schools: DrivingSchool[];
    isSchoolsLoading: boolean;
    activeSchool: DrivingSchool | null;
    loadError: string | null;
    deleteActionError: string | null;
    isListLoading: boolean;
    vehicles: Vehicle[];
    filteredVehicles: Vehicle[];
    searchTerm: string;
    statusFilter: VehicleStatusFilter;
    hasActiveFilters: boolean;
    resultsLabel: string;
    isDeleteLoading: boolean;
    isSetDefaultLoading: boolean;
    vehiclePendingDelete: Vehicle | null;
    statusUpdatingVehicleId: string | null;
}>();

const emit = defineEmits<{
    tabSelect: [panel: VehiclesListPanelId];
    searchChange: [value: string];
    statusFilterChange: [value: VehicleStatusFilter];
    clearFilters: [];
    schoolChange: [schoolId: string];
    retry: [];
    requestDelete: [vehicle: Vehicle];
    deleteDialogOpen: [open: boolean];
    cancelDelete: [];
    confirmDelete: [];
    setDefault: [vehicle: Vehicle];
    statusChange: [vehicle: Vehicle, payload: VehicleStatusUpdateBody];
}>();

const createVehicleTarget = '/vehicles/new';

const displayText = displayVehicleText;
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            title="Pojazdy"
            description="Zarządzaj flotą, dostępnością i terminami dokumentów."
        >
            <template #actions>
                <UiButton v-if="isManager && resolvedSchoolId" as-child>
                    <NuxtLink :to="createVehicleTarget">
                        <Plus class="size-4" aria-hidden="true" />
                        Dodaj pojazd
                    </NuxtLink>
                </UiButton>
            </template>
        </PageHeader>

        <section
            class="border-border bg-card min-w-0 overflow-hidden rounded-xl border shadow-xs"
            aria-label="Flota pojazdów"
            :aria-busy="isListLoading"
        >
            <VehiclesListToolbar
                :is-manager="isManager"
                :schools="schools"
                :selected-school-id="resolvedSchoolId"
                :selected-school="activeSchool"
                :is-schools-loading="isSchoolsLoading"
                :search-term="searchTerm"
                :status-filter="statusFilter"
                :active-panel="activePanel"
                :results-label="resultsLabel"
                :has-active-filters="hasActiveFilters"
                @school-change="emit('schoolChange', $event)"
                @search-change="emit('searchChange', $event)"
                @status-filter-change="emit('statusFilterChange', $event)"
                @clear-filters="emit('clearFilters')"
                @tab-select="emit('tabSelect', $event)"
            />

            <p
                v-if="deleteActionError"
                class="text-destructive border-border border-b px-4 py-3 text-sm sm:px-5"
                role="alert"
            >
                {{ deleteActionError }}
            </p>

            <LoadingState
                v-if="isListLoading && vehicles.length === 0"
                title="Wczytywanie floty…"
                class="m-4"
            />

            <ErrorState
                v-else-if="loadError"
                title="Nie udało się wczytać floty"
                :description="`${loadError} Spróbuj ponownie.`"
                class="m-4"
                @retry="emit('retry')"
            />

            <EmptyState
                v-else-if="filteredVehicles.length === 0"
                :title="
                    hasActiveFilters
                        ? 'Brak pasujących pojazdów'
                        : 'Brak pojazdów'
                "
                :description="
                    hasActiveFilters
                        ? 'Zmień kryteria wyszukiwania lub wyczyść filtry.'
                        : 'Nie zarejestrowano jeszcze żadnego pojazdu dla tej szkoły.'
                "
                class="m-4"
            >
                <template #action>
                    <UiButton
                        v-if="hasActiveFilters"
                        type="button"
                        variant="outline"
                        size="sm"
                        @click="emit('clearFilters')"
                    >
                        Wyczyść filtry
                    </UiButton>
                    <UiButton
                        v-else-if="isManager && resolvedSchoolId"
                        as-child
                        variant="secondary"
                        size="sm"
                    >
                        <NuxtLink :to="createVehicleTarget">
                            Dodaj pojazd
                        </NuxtLink>
                    </UiButton>
                </template>
            </EmptyState>

            <VehicleManagerStatusGrid
                v-else-if="isManager && activePanel === 'manager'"
                id="vehicles-status-panel"
                role="tabpanel"
                aria-labelledby="vehicles-status-tab"
                :vehicles="filteredVehicles"
                :status-updating-vehicle-id="statusUpdatingVehicleId"
                @status-change="
                    (vehicle, payload) => emit('statusChange', vehicle, payload)
                "
            />

            <div
                v-else
                id="vehicles-list-panel"
                role="tabpanel"
                aria-labelledby="vehicles-list-tab"
            >
                <div class="hidden overflow-x-auto md:block">
                    <VehiclesListDesktopTable
                        :is-manager="isManager"
                        :resolved-school-id="resolvedSchoolId"
                        :vehicles="filteredVehicles"
                        :is-delete-loading="isDeleteLoading"
                        :is-set-default-loading="isSetDefaultLoading"
                        :status-updating-vehicle-id="statusUpdatingVehicleId"
                        @request-delete="emit('requestDelete', $event)"
                        @set-default="emit('setDefault', $event)"
                    />
                </div>
                <div class="md:hidden">
                    <VehiclesListMobileCards
                        :is-manager="isManager"
                        :resolved-school-id="resolvedSchoolId"
                        :vehicles="filteredVehicles"
                        :is-delete-loading="isDeleteLoading"
                        :is-set-default-loading="isSetDefaultLoading"
                        @request-delete="emit('requestDelete', $event)"
                        @set-default="emit('setDefault', $event)"
                    />
                </div>
            </div>
        </section>

        <VehicleDeleteDialog
            :open="vehiclePendingDelete !== null"
            :vehicle-name="
                vehiclePendingDelete
                    ? displayText(vehiclePendingDelete.name)
                    : ''
            "
            :registration-number="
                vehiclePendingDelete
                    ? displayText(vehiclePendingDelete.registrationNumber)
                    : ''
            "
            :is-deleting="isDeleteLoading"
            @update:open="emit('deleteDialogOpen', $event)"
            @cancel="emit('cancelDelete')"
            @confirm="emit('confirmDelete')"
        />
    </div>
</template>
