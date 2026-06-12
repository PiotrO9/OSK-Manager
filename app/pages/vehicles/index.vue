<script setup lang="ts">
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
    contextMessage,
    loadError,
    deleteActionError,
    vehicles,
    vehiclePendingDelete,
    statusUpdatingVehicleId,
    activePanel,
    isListLoading,
    isDeleteLoading,
    isSetDefaultLoading,
    handleTabSelect,
    handleTabKeydown,
    handleRequestDeleteVehicle,
    handleVehicleDeleteDialogOpen,
    handleCancelDeleteVehicle,
    handleConfirmDeleteVehicle,
    handleSetDefaultVehicle,
    handleVehicleStatusChange,
} = useVehiclesListPage();
</script>

<template>
    <div class="space-y-6">
        <div class="space-y-1">
            <h1 class="text-foreground text-2xl font-semibold tracking-tight">
                Pojazdy
            </h1>
            <p class="text-muted-foreground text-sm">
                Lista pojazdów przypisanych do szkoły jazdy.
            </p>
        </div>

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
            :load-error="loadError"
            :delete-action-error="deleteActionError"
            :is-list-loading="isListLoading"
            :vehicles="vehicles"
            :is-delete-loading="isDeleteLoading"
            :is-set-default-loading="isSetDefaultLoading"
            :vehicle-pending-delete="vehiclePendingDelete"
            :status-updating-vehicle-id="statusUpdatingVehicleId"
            @tab-select="handleTabSelect"
            @tab-keydown="handleTabKeydown"
            @request-delete="handleRequestDeleteVehicle"
            @delete-dialog-open="handleVehicleDeleteDialogOpen"
            @cancel-delete="handleCancelDeleteVehicle"
            @confirm-delete="handleConfirmDeleteVehicle"
            @set-default="handleSetDefaultVehicle"
            @status-change="handleVehicleStatusChange"
        />
    </div>
</template>
