<script setup lang="ts">
import { User } from 'lucide-vue-next';
import {
    formatInstructorDisplayName,
    type InstructorListItem,
} from '~/types/instructor';
import type { CourseDetail } from '~/types/course';

defineProps<{
    course: CourseDetail;
    noInstructorValue: string;
    instructorName: string;
    instructorSaveBlockedReason: string;
    instructorsLoadError: string | null;
    isInstructorsLoading: boolean;
    isPatchLoading: boolean;
    effectiveSchoolId: string;
    instructors: InstructorListItem[];
    qualifiedInstructors: InstructorListItem[];
    canSaveInstructorAssignment: boolean;
}>();

defineEmits<{
    retryInstructors: [];
    instructorSelectChange: [];
    saveInstructorAssignment: [];
}>();

const selectedInstructorProfileId = defineModel<string>(
    'selectedInstructorProfileId',
    {
        required: true,
    },
);
</script>

<template>
    <UiCard class="overflow-hidden rounded-2xl shadow-sm">
        <UiCardHeader class="border-border border-b p-5">
            <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                    <UiCardTitle class="text-xl font-extrabold">
                        Przypisanie instruktora
                    </UiCardTitle>
                    <UiCardDescription>
                        Aktualizuj prowadzącego z listy instruktorów tej OSK.
                    </UiCardDescription>
                </div>
                <User
                    class="text-muted-foreground size-5 shrink-0"
                    aria-hidden="true"
                />
            </div>
        </UiCardHeader>
        <UiCardContent class="space-y-5 p-5">
            <div class="border-border rounded-2xl border p-4">
                <div
                    class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                >
                    <div class="min-w-0">
                        <p class="font-extrabold">Zapisany w kursie</p>
                        <p class="text-muted-foreground mt-1 text-sm">
                            To przypisanie jest używane przy organizacji zajec.
                        </p>
                    </div>
                    <StatusBadge
                        :label="instructorName"
                        :tone="course.instructor ? 'success' : 'neutral'"
                        subtle
                    />
                </div>
            </div>

            <p
                v-if="instructorSaveBlockedReason"
                class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700"
                role="status"
            >
                {{ instructorSaveBlockedReason }}
            </p>

            <ErrorState
                v-if="instructorsLoadError"
                title="Nie udało się wczytać instruktorów"
                :description="instructorsLoadError"
                @retry="$emit('retryInstructors')"
            />

            <div class="space-y-2">
                <UiLabel for="course-detail-instructor-select">
                    Zmiana przypisania
                </UiLabel>
                <p
                    v-if="isInstructorsLoading"
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    Wczytywanie listy instruktorów...
                </p>
                <UiSelect
                    v-else
                    v-model="selectedInstructorProfileId"
                    :disabled="!!instructorSaveBlockedReason || isPatchLoading"
                    @update:model-value="$emit('instructorSelectChange')"
                >
                    <UiSelectTrigger
                        id="course-detail-instructor-select"
                        class="h-11 w-full rounded-xl"
                        aria-label="Wybierz instruktora przypisanego do kursu lub pozostaw bez wyboru"
                    >
                        <UiSelectValue placeholder="Brak instruktora" />
                    </UiSelectTrigger>
                    <UiSelectContent>
                        <UiSelectGroup>
                            <UiSelectItem :value="noInstructorValue">
                                Brak instruktora
                            </UiSelectItem>
                            <UiSelectItem
                                v-for="ins in qualifiedInstructors"
                                :key="ins.id"
                                :value="ins.id"
                            >
                                {{ formatInstructorDisplayName(ins)
                                }}{{
                                    ins.email && ins.email.length > 0
                                        ? ` (${ins.email})`
                                        : ''
                                }}
                            </UiSelectItem>
                        </UiSelectGroup>
                    </UiSelectContent>
                </UiSelect>
                <p
                    v-if="
                        !isInstructorsLoading &&
                        effectiveSchoolId &&
                        instructors.length === 0
                    "
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    Brak instruktorów w tej szkole. Możesz wyczyścić przypisanie
                    albo dodać instruktorów w panelu OSK.
                </p>
                <p
                    v-else-if="
                        !isInstructorsLoading &&
                        effectiveSchoolId &&
                        qualifiedInstructors.length === 0
                    "
                    class="text-muted-foreground text-sm"
                    role="status"
                >
                    Brak instruktorów z uprawnieniem do kategorii tego kursu.
                </p>
            </div>

            <UiButton
                type="button"
                class="h-10 rounded-xl px-4 font-semibold"
                :disabled="!canSaveInstructorAssignment"
                :aria-busy="isPatchLoading"
                @click="$emit('saveInstructorAssignment')"
            >
                {{ isPatchLoading ? 'Zapisywanie...' : 'Zapisz przypisanie' }}
            </UiButton>
        </UiCardContent>
    </UiCard>
</template>
