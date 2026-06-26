<script setup lang="ts">
import {
    CalendarDays,
    Car,
    Eye,
    LayoutList,
    Pencil,
    Plus,
    Shield,
    Trash2,
} from 'lucide-vue-next';
import type { VehiclesListPanelId } from '~/composables/vehicles/useVehiclesListPage';
import type { Vehicle, VehicleStatus } from '~/types/vehicles/vehicle';

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
    statusChange: [vehicle: Vehicle, status: VehicleStatus];
}>();

const {
    activePanelLabel,
    checkedToVehicleStatus,
    createVehicleTarget,
    displayText,
    formatOptionalDate,
    formatVehicleMeta,
    isVehicleAvailable,
    resultsLabel,
    summaryItems,
    vehicleStatusLabel,
    vehicleStatusTone,
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
                <div
                    class="flex flex-wrap gap-1.5"
                    role="tablist"
                    aria-label="Widok listy pojazdów"
                >
                    <button
                        type="button"
                        role="tab"
                        class="focus-visible:ring-primary inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        :class="
                            activePanel === 'simple'
                                ? 'border-sky-200 bg-sky-50 text-sky-700'
                                : 'border-border bg-background text-muted-foreground hover:text-foreground'
                        "
                        :aria-selected="activePanel === 'simple'"
                        tabindex="0"
                        @click="emit('tabSelect', 'simple')"
                        @keydown="emit('tabKeydown', $event, 'simple')"
                    >
                        <LayoutList class="size-3.5" aria-hidden="true" />
                        Lista
                    </button>
                    <button
                        type="button"
                        role="tab"
                        class="focus-visible:ring-primary inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        :class="
                            activePanel === 'manager'
                                ? 'border-sky-200 bg-sky-50 text-sky-700'
                                : 'border-border bg-background text-muted-foreground hover:text-foreground'
                        "
                        :aria-selected="activePanel === 'manager'"
                        tabindex="0"
                        @click="emit('tabSelect', 'manager')"
                        @keydown="emit('tabKeydown', $event, 'manager')"
                    >
                        <Shield class="size-3.5" aria-hidden="true" />
                        Status
                    </button>
                </div>
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
            <table class="w-full min-w-[900px] text-left text-sm">
                <thead class="bg-muted/35 text-muted-foreground border-b">
                    <tr>
                        <th scope="col" class="px-4 py-3 font-semibold">
                            Nazwa
                        </th>
                        <th scope="col" class="px-4 py-3 font-semibold">
                            Dane
                        </th>
                        <th scope="col" class="px-4 py-3 font-semibold">
                            Status
                        </th>
                        <th scope="col" class="px-4 py-3 font-semibold">
                            Terminy
                        </th>
                        <th
                            scope="col"
                            class="px-4 py-3 text-right font-semibold"
                        >
                            Akcje
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-border divide-y">
                    <tr
                        v-for="vehicle in vehicles"
                        :key="vehicle.id"
                        class="hover:bg-muted/25"
                    >
                        <td class="px-4 py-3">
                            <div class="min-w-0">
                                <p
                                    class="text-foreground truncate font-extrabold"
                                    :title="displayText(vehicle.name)"
                                >
                                    {{ displayText(vehicle.name) }}
                                </p>
                                <p
                                    class="text-muted-foreground mt-0.5 truncate text-xs"
                                    :title="
                                        displayText(vehicle.registrationNumber)
                                    "
                                >
                                    {{
                                        displayText(vehicle.registrationNumber)
                                    }}
                                </p>
                            </div>
                        </td>
                        <td class="text-muted-foreground px-4 py-3">
                            {{ formatVehicleMeta(vehicle) }}
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex flex-wrap items-center gap-2">
                                <StatusBadge
                                    :label="vehicleStatusLabel(vehicle)"
                                    :tone="vehicleStatusTone(vehicle)"
                                />
                                <StatusBadge
                                    v-if="vehicle.isDefault"
                                    label="Domyślny"
                                    tone="info"
                                    subtle
                                />
                                <span
                                    v-if="
                                        statusUpdatingVehicleId === vehicle.id
                                    "
                                    class="text-muted-foreground text-xs"
                                    role="status"
                                >
                                    Zapisywanie...
                                </span>
                            </div>
                        </td>
                        <td class="text-muted-foreground px-4 py-3">
                            <div class="space-y-1 text-xs">
                                <p>
                                    Przeglad:
                                    {{
                                        formatOptionalDate(
                                            vehicle.inspectionDate,
                                        )
                                    }}
                                </p>
                                <p>
                                    OC:
                                    {{
                                        formatOptionalDate(
                                            vehicle.insuranceDate,
                                        )
                                    }}
                                </p>
                            </div>
                        </td>
                        <td class="px-4 py-3">
                            <ActionGroup
                                v-if="isManager && resolvedSchoolId"
                                :label="`Akcje: ${displayText(vehicle.name)}`"
                                align="end"
                                density="compact"
                            >
                                <UiButton
                                    as-child
                                    variant="outline"
                                    size="sm"
                                    class="rounded-full"
                                >
                                    <NuxtLink
                                        :to="{
                                            path: `/vehicles/${vehicle.id}`,
                                            query: {
                                                schoolId: resolvedSchoolId,
                                            },
                                        }"
                                        :aria-label="`Szczegóły pojazdu ${displayText(vehicle.name)}, ${displayText(vehicle.registrationNumber)}`"
                                    >
                                        Szczegóły
                                    </NuxtLink>
                                </UiButton>
                                <UiButton
                                    as-child
                                    variant="ghost"
                                    size="icon"
                                    class="size-9 rounded-full"
                                >
                                    <NuxtLink
                                        :to="{
                                            path: `/vehicles/${vehicle.id}/edit`,
                                            query: {
                                                schoolId: resolvedSchoolId,
                                            },
                                        }"
                                        class="inline-flex size-9 items-center justify-center"
                                        :aria-label="`Edytuj pojazd ${displayText(vehicle.name)}, ${displayText(vehicle.registrationNumber)}`"
                                    >
                                        <Pencil
                                            class="size-4"
                                            aria-hidden="true"
                                        />
                                    </NuxtLink>
                                </UiButton>
                                <UiButton
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    class="text-destructive hover:bg-destructive/10 hover:text-destructive size-9 rounded-full"
                                    :disabled="isDeleteLoading"
                                    :aria-label="`Usun pojazd ${displayText(vehicle.name)}, ${displayText(vehicle.registrationNumber)}`"
                                    @click="emit('requestDelete', vehicle)"
                                >
                                    <Trash2 class="size-4" aria-hidden="true" />
                                </UiButton>
                            </ActionGroup>
                        </td>
                    </tr>
                </tbody>
            </table>

            <template #mobile>
                <div class="space-y-3 p-3">
                    <article
                        v-for="vehicle in vehicles"
                        :key="vehicle.id"
                        class="border-border bg-background rounded-2xl border p-4"
                    >
                        <div class="flex min-w-0 items-start gap-3">
                            <div
                                class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"
                            >
                                <Car class="size-4" aria-hidden="true" />
                            </div>
                            <div class="min-w-0 flex-1">
                                <p
                                    class="text-foreground truncate font-extrabold"
                                >
                                    {{ displayText(vehicle.name) }}
                                </p>
                                <p
                                    class="text-muted-foreground mt-1 truncate text-sm"
                                >
                                    {{
                                        displayText(vehicle.registrationNumber)
                                    }}
                                </p>
                            </div>
                        </div>

                        <div class="mt-3 flex flex-wrap gap-2">
                            <StatusBadge
                                :label="vehicleStatusLabel(vehicle)"
                                :tone="vehicleStatusTone(vehicle)"
                            />
                            <StatusBadge
                                v-if="vehicle.isDefault"
                                label="Domyślny"
                                tone="info"
                                subtle
                            />
                            <StatusBadge
                                :label="formatVehicleMeta(vehicle)"
                                tone="neutral"
                                subtle
                            />
                        </div>

                        <div
                            v-if="isManager && activePanel === 'manager'"
                            class="mt-4 flex flex-wrap items-center justify-between gap-3"
                        >
                            <label
                                class="text-foreground bg-muted/40 border-border inline-flex items-center gap-3 rounded-lg border px-3 py-2 text-xs font-medium"
                                :for="`vehicle-status-mobile-${vehicle.id}`"
                            >
                                <span>{{ vehicleStatusLabel(vehicle) }}</span>
                                <UiSwitch
                                    :id="`vehicle-status-mobile-${vehicle.id}`"
                                    class="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-300"
                                    :model-value="isVehicleAvailable(vehicle)"
                                    :disabled="
                                        statusUpdatingVehicleId === vehicle.id
                                    "
                                    :aria-label="`Zmien status pojazdu ${displayText(vehicle.name)}, ${displayText(vehicle.registrationNumber)}`"
                                    :aria-busy="
                                        statusUpdatingVehicleId === vehicle.id
                                    "
                                    @update:model-value="
                                        emit(
                                            'statusChange',
                                            vehicle,
                                            checkedToVehicleStatus($event),
                                        )
                                    "
                                />
                            </label>
                        </div>

                        <ActionGroup
                            v-if="isManager && resolvedSchoolId"
                            class="mt-4"
                            :label="`Akcje: ${displayText(vehicle.name)}`"
                            density="compact"
                        >
                            <UiButton
                                as-child
                                variant="outline"
                                size="sm"
                                class="rounded-full"
                            >
                                <NuxtLink
                                    :to="{
                                        path: `/vehicles/${vehicle.id}`,
                                        query: {
                                            schoolId: resolvedSchoolId,
                                        },
                                    }"
                                >
                                    <Eye class="size-4" aria-hidden="true" />
                                    Szczegóły
                                </NuxtLink>
                            </UiButton>
                            <UiButton
                                as-child
                                variant="outline"
                                size="icon"
                                class="size-9 rounded-full"
                            >
                                <NuxtLink
                                    :to="{
                                        path: `/vehicles/${vehicle.id}/edit`,
                                        query: {
                                            schoolId: resolvedSchoolId,
                                        },
                                    }"
                                    class="inline-flex size-9 items-center justify-center"
                                    :aria-label="`Edytuj pojazd ${displayText(vehicle.name)}, ${displayText(vehicle.registrationNumber)}`"
                                >
                                    <Pencil class="size-4" aria-hidden="true" />
                                </NuxtLink>
                            </UiButton>
                            <UiButton
                                type="button"
                                variant="outline"
                                size="icon"
                                class="text-destructive hover:bg-destructive/10 hover:text-destructive size-9 rounded-full"
                                :disabled="isDeleteLoading"
                                :aria-label="`Usun pojazd ${displayText(vehicle.name)}, ${displayText(vehicle.registrationNumber)}`"
                                @click="emit('requestDelete', vehicle)"
                            >
                                <Trash2 class="size-4" aria-hidden="true" />
                            </UiButton>
                        </ActionGroup>

                        <UiButton
                            v-if="
                                isManager &&
                                resolvedSchoolId &&
                                !vehicle.isDefault
                            "
                            type="button"
                            variant="secondary"
                            size="sm"
                            class="mt-3 w-full rounded-xl"
                            :disabled="isSetDefaultLoading"
                            :aria-busy="isSetDefaultLoading"
                            :aria-label="`Ustaw jako domyslny: ${displayText(vehicle.name)}, ${displayText(vehicle.registrationNumber)}`"
                            @click="emit('setDefault', vehicle)"
                        >
                            Ustaw jako domyslny
                        </UiButton>
                    </article>
                </div>
            </template>
        </DataTableShell>

        <div
            v-if="isManager && activePanel === 'manager' && vehicles.length > 0"
            class="border-border bg-card rounded-xl border p-4 shadow-xs"
        >
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="min-w-0">
                    <p class="text-foreground text-sm font-semibold">
                        Szybka kontrola statusow
                    </p>
                    <p class="text-muted-foreground mt-1 text-xs">
                        Przełącz dostępność pojazdów bez wchodzenia w edycję.
                    </p>
                </div>
            </div>
            <div class="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                <label
                    v-for="vehicle in vehicles"
                    :key="`status-control-${vehicle.id}`"
                    class="border-border bg-background flex items-center justify-between gap-3 rounded-xl border px-3 py-2"
                    :for="`vehicle-status-${vehicle.id}`"
                >
                    <span class="min-w-0">
                        <span
                            class="text-foreground block truncate text-sm font-semibold"
                        >
                            {{ displayText(vehicle.name) }}
                        </span>
                        <span class="text-muted-foreground block text-xs">
                            {{ displayText(vehicle.registrationNumber) }}
                        </span>
                    </span>
                    <UiSwitch
                        :id="`vehicle-status-${vehicle.id}`"
                        class="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-300"
                        :model-value="isVehicleAvailable(vehicle)"
                        :disabled="statusUpdatingVehicleId === vehicle.id"
                        :aria-label="`Zmien status pojazdu ${displayText(vehicle.name)}, ${displayText(vehicle.registrationNumber)}`"
                        :aria-busy="statusUpdatingVehicleId === vehicle.id"
                        @update:model-value="
                            emit(
                                'statusChange',
                                vehicle,
                                checkedToVehicleStatus($event),
                            )
                        "
                    />
                </label>
            </div>
        </div>

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
