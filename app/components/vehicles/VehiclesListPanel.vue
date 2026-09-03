<script setup lang="ts">
import { CalendarDays, Plus } from 'lucide-vue-next';
import type { VehicleStatusUpdateBody } from '~/composables/vehicles/useVehiclesApi';
import type { VehiclesListPanelId } from '~/composables/vehicles/useVehiclesListPage';
import type { Vehicle } from '~/types/vehicles/vehicle';

const props = defineProps<{
    isManager: boolean;
    activePanel: VehiclesListPanelId;
    resolvedSchoolId: string | null;
    loadError: string | null;
    deleteActionError: string | null;
    isListLoading: boolean;
    vehicles: Vehicle[];
    isDeleteLoading: boolean;
    isSetDefaultLoading: boolean;
    vehiclePendingDelete: Vehicle | null;
    statusUpdatingVehicleId: string | null;
}>();

const emit = defineEmits<{
    tabSelect: [panel: VehiclesListPanelId];
    tabKeydown: [event: KeyboardEvent, panel: VehiclesListPanelId];
    requestDelete: [vehicle: Vehicle];
    deleteDialogOpen: [open: boolean];
    cancelDelete: [];
    confirmDelete: [];
    setDefault: [vehicle: Vehicle];
    statusChange: [vehicle: Vehicle, payload: VehicleStatusUpdateBody];
}>();

const {
    activePanelLabel,
    createVehicleTarget,
    displayText,
    resultsLabel,
    summaryItems,
} = useVehiclesListPanelSummary(props);
</script>

<template>
    <div class="space-y-5">
        <PageHeader
            title="Pojazdy"
            description="Flota OSK, statusy techniczne i przypisanie do szkoły."
        >
            <template #actions>
                <UiButton
                    variant="outline"
                    class="h-10 rounded-xl px-4 font-semibold"
                >
                    <CalendarDays class="size-4" aria-hidden="true" />
                    Aktualna flota
                </UiButton>
                <UiButton
                    v-if="isManager && resolvedSchoolId"
                    as-child
                    class="h-10 rounded-xl px-4 font-semibold shadow-sm"
                >
                    <NuxtLink
                        :to="createVehicleTarget"
                        class="inline-flex items-center justify-center gap-2"
                    >
                        <Plus class="size-4" aria-hidden="true" />
                        Dodaj pojazd
                    </NuxtLink>
                </UiButton>
            </template>
        </PageHeader>

        <SummaryStrip :items="summaryItems" />

        <FilterBar :result-label="resultsLabel" :is-loading="isListLoading">
            <StatusBadge label="Wybrana OSK" tone="info" subtle />
            <StatusBadge
                :label="`Tryb: ${activePanelLabel}`"
                tone="neutral"
                subtle
            />
            <StatusBadge
                label="Zakres: wszystkie pojazdy"
                tone="neutral"
                subtle
            />

            <template v-if="isManager" #actions>
                <VehiclesListModeTabs
                    :active-panel="activePanel"
                    @tab-select="emit('tabSelect', $event)"
                    @tab-keydown="
                        (event, panel) => emit('tabKeydown', event, panel)
                    "
                />
            </template>
        </FilterBar>

        <p
            v-if="deleteActionError"
            class="text-destructive text-sm"
            role="alert"
        >
            {{ deleteActionError }}
        </p>

        <DataTableShell
            v-if="loadError || (isListLoading && vehicles.length === 0)"
            :is-loading="isListLoading && vehicles.length === 0"
            :error-message="loadError"
        />

        <EmptyState
            v-else-if="vehicles.length === 0"
            title="Brak pojazdów"
            description="Nie zarejestrowano jeszcze żadnego pojazdu dla tej szkoły."
        >
            <template v-if="isManager && resolvedSchoolId" #action>
                <UiButton as-child variant="secondary" size="sm">
                    <NuxtLink :to="createVehicleTarget">Dodaj pojazd</NuxtLink>
                </UiButton>
            </template>
        </EmptyState>

        <DataTableShell v-else>
            <VehiclesListDesktopTable
                :is-manager="isManager"
                :resolved-school-id="resolvedSchoolId"
                :vehicles="vehicles"
                :is-delete-loading="isDeleteLoading"
                :status-updating-vehicle-id="statusUpdatingVehicleId"
                @request-delete="emit('requestDelete', $event)"
            />

            <template #mobile>
                <VehiclesListMobileCards
                    :is-manager="isManager"
                    :active-panel="activePanel"
                    :resolved-school-id="resolvedSchoolId"
                    :vehicles="vehicles"
                    :is-delete-loading="isDeleteLoading"
                    :is-set-default-loading="isSetDefaultLoading"
                    :status-updating-vehicle-id="statusUpdatingVehicleId"
                    @status-change="
                        (vehicle, payload) =>
                            emit('statusChange', vehicle, payload)
                    "
                    @request-delete="emit('requestDelete', $event)"
                    @set-default="emit('setDefault', $event)"
                />
            </template>
        </DataTableShell>

        <VehicleManagerStatusGrid
            v-if="isManager && activePanel === 'manager' && vehicles.length > 0"
            :vehicles="vehicles"
            :status-updating-vehicle-id="statusUpdatingVehicleId"
            @status-change="
                (vehicle, payload) => emit('statusChange', vehicle, payload)
            "
        />

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
