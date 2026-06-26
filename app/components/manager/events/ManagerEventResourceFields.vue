<script setup lang="ts">
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructors/instructor';
import type { Vehicle } from '~/types/vehicles/vehicle';

defineProps<{
    eventType: string;
    schoolId: string;
    instructors: InstructorListItem[];
    instructorSelectLabel: string;
    isInstructorsLoading: boolean;
    instructorsError: string | null;
    vehicles: Vehicle[];
    isVehiclesLoading: boolean;
    vehiclesError: string | null;
    isSaving: boolean;
}>();
const instructorId = defineModel<string>('instructorId', { required: true });
const vehicleId = defineModel<string>('vehicleId', { required: true });
</script>

<template>
    <div class="grid gap-4 lg:grid-cols-2">
        <div class="space-y-2">
            <UiLabel for="edit-event-instructor">Instruktor</UiLabel>
            <p
                v-if="isInstructorsLoading"
                class="text-muted-foreground text-xs"
                role="status"
            >
                Wczytywanie instruktorów...
            </p>
            <p
                v-else-if="instructorsError"
                class="text-destructive text-xs"
                role="alert"
            >
                {{ instructorsError }}
            </p>
            <UiSelect
                v-model="instructorId"
                :disabled="!schoolId || isInstructorsLoading || isSaving"
            >
                <UiSelectTrigger
                    id="edit-event-instructor"
                    class="w-full"
                    aria-label="Instruktor prowadzący blok"
                >
                    <UiSelectValue placeholder="Wybierz instruktora" />
                </UiSelectTrigger>
                <UiSelectContent>
                    <UiSelectGroup>
                        <UiSelectItem
                            v-if="
                                instructorId.trim() &&
                                !instructors.some(
                                    (inst) => inst.id === instructorId.trim(),
                                )
                            "
                            :value="instructorId.trim()"
                        >
                            {{ instructorSelectLabel }}
                        </UiSelectItem>
                        <UiSelectItem
                            v-for="i in instructors"
                            :key="i.id"
                            :value="i.id"
                        >
                            {{ formatInstructorDisplayName(i) }}
                        </UiSelectItem>
                    </UiSelectGroup>
                </UiSelectContent>
            </UiSelect>
            <p
                v-if="!schoolId"
                class="text-muted-foreground text-xs"
                role="status"
            >
                Dodaj <code class="text-xs">?schoolId=</code> w adresie, aby
                zmienić instruktora z listy OSK.
            </p>
        </div>

        <div v-if="eventType === 'DRIVE'" class="space-y-2">
            <UiLabel for="edit-event-vehicle">Pojazd</UiLabel>
            <p
                v-if="isVehiclesLoading"
                class="text-muted-foreground text-xs"
                role="status"
            >
                Wczytywanie pojazdów...
            </p>
            <p
                v-else-if="vehiclesError"
                class="text-destructive text-xs"
                role="alert"
            >
                {{ vehiclesError }}
            </p>
            <UiSelect
                v-model="vehicleId"
                :disabled="
                    !schoolId ||
                    vehicles.length === 0 ||
                    isVehiclesLoading ||
                    isSaving
                "
            >
                <UiSelectTrigger
                    id="edit-event-vehicle"
                    class="w-full"
                    aria-label="Pojazd dla bloku jazdy"
                >
                    <UiSelectValue placeholder="- Wybierz pojazd -" />
                </UiSelectTrigger>
                <UiSelectContent>
                    <UiSelectGroup>
                        <UiSelectItem
                            v-for="v in vehicles"
                            :key="v.id"
                            :value="v.id"
                        >
                            {{ v.name }} ({{ v.registrationNumber }})
                        </UiSelectItem>
                    </UiSelectGroup>
                </UiSelectContent>
            </UiSelect>
        </div>
    </div>
</template>
