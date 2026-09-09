<script setup lang="ts">
import { Check, RotateCcw } from 'lucide-vue-next';
import {
    designSystemInstructors,
    designSystemSlot,
    designSystemVehicles,
} from '~/data/design-system/fixtures';

const selectedInstructorId = shallowRef('instructor-1');
const selectedVehicleId = shallowRef('vehicle-1');
const selectedStudent = shallowRef('student-1');
const isConfirmed = shallowRef(false);

const selectedStudentLabel = computed(() =>
    selectedStudent.value === 'student-2'
        ? 'Michał Zieliński · kat. B'
        : 'Anna Kowalska · kat. B',
);

function reset() {
    selectedInstructorId.value = 'instructor-1';
    selectedVehicleId.value = 'vehicle-1';
    selectedStudent.value = 'student-1';
    isConfirmed.value = false;
}
</script>

<template>
    <FormSection
        title="Rezerwacja jazdy"
        description="Termin, kursant, instruktor i pojazd w jednym krótkim procesie."
    >
        <div class="space-y-4">
            <ManagerLessonBookingSlotSummary
                :slot-ctx="designSystemSlot"
                :available-instructors="designSystemInstructors"
                instructor-label="Marek Nowak"
                slot-when-label="czwartek, 10 września · 08:00–09:30"
            />
            <div class="space-y-2">
                <UiLabel for="design-booking-student">Kursant</UiLabel>
                <UiSelect v-model="selectedStudent"
                    ><UiSelectTrigger id="design-booking-student" class="w-full"
                        ><UiSelectValue>{{
                            selectedStudentLabel
                        }}</UiSelectValue></UiSelectTrigger
                    ><UiSelectContent
                        ><UiSelectItem value="student-1"
                            >Anna Kowalska · kat. B</UiSelectItem
                        ><UiSelectItem value="student-2"
                            >Michał Zieliński · kat. B</UiSelectItem
                        ></UiSelectContent
                    ></UiSelect
                >
            </div>
            <ManagerLessonBookingInstructorSelect
                v-model:selected-instructor-id="selectedInstructorId"
                :instructors="designSystemInstructors"
                :disabled="false"
            />
            <ManagerLessonBookingVehicleSelect
                v-model:selected-vehicle-id="selectedVehicleId"
                :vehicles="designSystemVehicles"
                :disabled="false"
            />
            <p
                v-if="isConfirmed"
                class="border-success-200 bg-success-50 text-success-700 rounded-md border px-3 py-2 text-sm"
                role="status"
            >
                <Check class="mr-2 inline size-4" aria-hidden="true" />
                Rezerwacja została przygotowana lokalnie.
            </p>
        </div>
        <template #footer
            ><ActionGroup label="Akcje rezerwacji" align="end"
                ><UiButton variant="ghost" @click="reset"
                    ><RotateCcw aria-hidden="true" /> Reset</UiButton
                ><UiButton @click="isConfirmed = true"
                    >Potwierdź termin</UiButton
                ></ActionGroup
            ></template
        >
    </FormSection>
</template>
