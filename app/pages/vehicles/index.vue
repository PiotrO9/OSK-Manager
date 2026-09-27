<script setup lang="ts">
import VehiclesListPanel from '~/components/vehicles/VehiclesListPanel.vue';
import { useVehiclesListPage } from '~/composables/vehicles/useVehiclesListPage';

definePageMeta({
    layout: 'app-shell',
});

usePageMeta({
    title: () => 'Pojazdy',
    description: () => 'Lista pojazdów szkoły jazdy.',
});

const {
    isManager,
    resolvedSchoolId,
    schools,
    isSchoolsLoading,
    activeSchoolName,
    contextMessage,
    loadError,
    deleteActionError,
    vehicles,
    filteredVehicles,
    searchTerm,
    statusFilter,
    hasActiveFilters,
    resultsLabel,
    vehiclePendingDelete,
    statusUpdatingVehicleId,
    activePanel,
    isListLoading,
    isDeleteLoading,
    isSetDefaultLoading,
    handleTabSelect,
    handleSearchChange,
    handleStatusFilterChange,
    handleClearFilters,
    handleSchoolChange,
    handleRetryLoad,
    handleRequestDeleteVehicle,
    handleVehicleDeleteDialogOpen,
    handleCancelDeleteVehicle,
    handleConfirmDeleteVehicle,
    handleSetDefaultVehicle,
    handleVehicleStatusChange,
} = useVehiclesListPage();
</script>

<template>
    <div>
        <p
            v-if="contextMessage"
            class="text-muted-foreground text-sm"
            role="status"
        >
            {{ contextMessage }}
        </p>

        <VehiclesListPanel
            v-else
            :is-manager="isManager"
            :active-panel="activePanel"
            :resolved-school-id="resolvedSchoolId"
            :schools="schools"
            :is-schools-loading="isSchoolsLoading"
            :active-school-name="activeSchoolName"
            :load-error="loadError"
            :delete-action-error="deleteActionError"
            :is-list-loading="isListLoading"
            :vehicles="vehicles"
            :filtered-vehicles="filteredVehicles"
            :search-term="searchTerm"
            :status-filter="statusFilter"
            :has-active-filters="hasActiveFilters"
            :results-label="resultsLabel"
            :is-delete-loading="isDeleteLoading"
            :is-set-default-loading="isSetDefaultLoading"
            :vehicle-pending-delete="vehiclePendingDelete"
            :status-updating-vehicle-id="statusUpdatingVehicleId"
            @tab-select="handleTabSelect"
            @search-change="handleSearchChange"
            @status-filter-change="handleStatusFilterChange"
            @clear-filters="handleClearFilters"
            @school-change="handleSchoolChange"
            @retry="handleRetryLoad"
            @request-delete="handleRequestDeleteVehicle"
            @delete-dialog-open="handleVehicleDeleteDialogOpen"
            @cancel-delete="handleCancelDeleteVehicle"
            @confirm-delete="handleConfirmDeleteVehicle"
            @set-default="handleSetDefaultVehicle"
            @status-change="handleVehicleStatusChange"
        />
    </div>
</template>
