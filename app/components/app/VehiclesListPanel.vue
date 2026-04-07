<script setup lang="ts">
import { Car, Eye, LayoutList, Pencil, Shield, Trash2 } from 'lucide-vue-next';
import type { Vehicle } from '~/types/vehicle';
import type { VehiclesListPanelId } from '~/composables/useVehiclesListPage';

defineProps<{
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
}>();

const emit = defineEmits<{
    tabSelect: [panel: VehiclesListPanelId];
    tabKeydown: [event: KeyboardEvent, panel: VehiclesListPanelId];
    requestDelete: [vehicle: Vehicle];
    deleteDialogOpen: [open: boolean];
    cancelDelete: [];
    confirmDelete: [];
    setDefault: [vehicle: Vehicle];
}>();

function displayText(value: string): string {
    const t = value.trim();

    return t.length > 0 ? t : '—';
}
</script>

<template>
    <div class="space-y-6">
        <div
            v-if="isManager"
            class="border-border flex flex-wrap gap-2 border-b pb-3"
            role="tablist"
            aria-label="Widok listy pojazdów"
        >
            <button
                type="button"
                role="tab"
                class="focus-visible:ring-primary inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                :class="
                    activePanel === 'simple'
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                "
                :aria-selected="activePanel === 'simple'"
                tabindex="0"
                @click="emit('tabSelect', 'simple')"
                @keydown="emit('tabKeydown', $event, 'simple')"
            >
                <LayoutList class="size-4 shrink-0" aria-hidden="true" />
                Lista
            </button>
            <button
                type="button"
                role="tab"
                class="focus-visible:ring-primary inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                :class="
                    activePanel === 'manager'
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                "
                :aria-selected="activePanel === 'manager'"
                tabindex="0"
                @click="emit('tabSelect', 'manager')"
                @keydown="emit('tabKeydown', $event, 'manager')"
            >
                <Shield class="size-4 shrink-0" aria-hidden="true" />
                Status i domyślny
            </button>
        </div>

        <div
            v-if="isManager && resolvedSchoolId"
            class="flex flex-wrap items-center gap-2"
        >
            <UiButton as-child variant="default" size="sm">
                <NuxtLink
                    :to="{
                        path: '/vehicles/new',
                        query: { schoolId: resolvedSchoolId },
                    }"
                >
                    Dodaj pojazd
                </NuxtLink>
            </UiButton>
        </div>

        <p v-if="loadError" class="text-destructive text-sm" role="alert">
            {{ loadError }}
        </p>

        <p
            v-if="deleteActionError"
            class="text-destructive text-sm"
            role="alert"
        >
            {{ deleteActionError }}
        </p>

        <div
            v-else-if="isListLoading && vehicles.length === 0"
            class="text-muted-foreground text-sm"
            role="status"
        >
            Wczytywanie listy pojazdów…
        </div>

        <div
            v-else-if="vehicles.length === 0"
            class="border-border bg-muted/20 rounded-2xl border border-dashed px-6 py-10 text-center"
            role="status"
        >
            <Car
                class="text-muted-foreground mx-auto mb-3 size-10"
                aria-hidden="true"
            />
            <p class="text-foreground font-medium">Brak pojazdów</p>
            <p class="text-muted-foreground mt-1 text-sm">
                Nie zarejestrowano jeszcze żadnego pojazdu dla tej szkoły.
            </p>
            <div v-if="isManager" class="mt-4 flex flex-col items-center gap-2">
                <UiButton
                    v-if="resolvedSchoolId"
                    as-child
                    variant="secondary"
                    size="sm"
                >
                    <NuxtLink
                        :to="{
                            path: '/vehicles/new',
                            query: { schoolId: resolvedSchoolId },
                        }"
                    >
                        Dodaj pojazd
                    </NuxtLink>
                </UiButton>
                <NuxtLink
                    to="/manager/osk"
                    class="text-primary inline-block text-sm font-medium underline-offset-4 hover:underline"
                >
                    Zarządzaj szkołami jazdy
                </NuxtLink>
            </div>
        </div>

        <ul
            v-else
            class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
        >
            <li
                v-for="vehicle in vehicles"
                :key="vehicle.id"
                role="listitem"
                class="border-border flex min-w-0 flex-col rounded-2xl border bg-white p-6 transition dark:bg-transparent"
            >
                <div class="min-w-0 space-y-3">
                    <div
                        class="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                    >
                        <div class="min-w-0 flex-1 overflow-hidden">
                            <p
                                :id="`vehicle-name-${vehicle.id}`"
                                class="text-foreground truncate text-base font-semibold"
                                :title="displayText(vehicle.name)"
                            >
                                {{ displayText(vehicle.name) }}
                            </p>
                            <p
                                class="text-muted-foreground mt-1 truncate font-mono text-sm tracking-wide"
                                :aria-labelledby="`vehicle-name-${vehicle.id}`"
                                :title="displayText(vehicle.registrationNumber)"
                            >
                                {{ displayText(vehicle.registrationNumber) }}
                            </p>
                            <div
                                v-if="vehicle.isDefault"
                                class="mt-3 flex flex-wrap gap-2"
                            >
                                <UiBadge variant="default" class="shrink-0">
                                    Domyślny
                                </UiBadge>
                            </div>
                        </div>
                        <div
                            v-if="isManager && resolvedSchoolId"
                            class="border-border bg-muted/25 divide-border inline-flex w-fit max-w-full shrink-0 divide-x overflow-hidden rounded-lg border max-sm:self-end"
                            role="group"
                            :aria-label="`Akcje: ${displayText(vehicle.name)}`"
                        >
                            <UiButton
                                as-child
                                variant="ghost"
                                size="icon"
                                class="h-10 w-10 shrink-0 cursor-pointer rounded-none"
                            >
                                <NuxtLink
                                    :to="{
                                        path: `/vehicles/${vehicle.id}`,
                                        query: {
                                            schoolId: resolvedSchoolId,
                                        },
                                    }"
                                    class="inline-flex size-10 items-center justify-center"
                                    :aria-label="`Szczegóły pojazdu ${displayText(vehicle.name)}, ${displayText(vehicle.registrationNumber)}`"
                                >
                                    <Eye
                                        class="size-4 shrink-0"
                                        aria-hidden="true"
                                    />
                                </NuxtLink>
                            </UiButton>
                            <UiButton
                                as-child
                                variant="ghost"
                                size="icon"
                                class="h-10 w-10 shrink-0 cursor-pointer rounded-none"
                            >
                                <NuxtLink
                                    :to="{
                                        path: `/vehicles/${vehicle.id}/edit`,
                                        query: {
                                            schoolId: resolvedSchoolId,
                                        },
                                    }"
                                    class="inline-flex size-10 items-center justify-center"
                                    :aria-label="`Edytuj pojazd ${displayText(vehicle.name)}, ${displayText(vehicle.registrationNumber)}`"
                                >
                                    <Pencil
                                        class="size-4 shrink-0"
                                        aria-hidden="true"
                                    />
                                </NuxtLink>
                            </UiButton>
                            <UiButton
                                type="button"
                                variant="ghost"
                                size="icon"
                                class="text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20 h-10 w-10 shrink-0 cursor-pointer rounded-none"
                                :disabled="isDeleteLoading"
                                :aria-label="`Usuń pojazd ${displayText(vehicle.name)}, ${displayText(vehicle.registrationNumber)}`"
                                @click="emit('requestDelete', vehicle)"
                            >
                                <Trash2
                                    class="size-4 shrink-0"
                                    aria-hidden="true"
                                />
                            </UiButton>
                        </div>
                    </div>

                    <div
                        v-if="isManager && activePanel === 'manager'"
                        class="flex flex-wrap items-center gap-2 pt-0.5"
                    >
                        <UiBadge
                            v-if="vehicle.status === 'UNAVAILABLE'"
                            variant="destructive"
                            class="shrink-0"
                        >
                            Niedostępny
                        </UiBadge>
                        <UiBadge v-else variant="secondary" class="shrink-0">
                            Aktywny
                        </UiBadge>
                    </div>

                    <UiButton
                        v-if="
                            isManager && resolvedSchoolId && !vehicle.isDefault
                        "
                        type="button"
                        variant="secondary"
                        size="sm"
                        class="w-full sm:w-auto"
                        :disabled="isSetDefaultLoading"
                        :aria-busy="isSetDefaultLoading"
                        :aria-label="`Ustaw jako domyślny: ${displayText(vehicle.name)}, ${displayText(vehicle.registrationNumber)}`"
                        @click="emit('setDefault', vehicle)"
                    >
                        Ustaw jako domyślny
                    </UiButton>
                </div>
            </li>
        </ul>

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
