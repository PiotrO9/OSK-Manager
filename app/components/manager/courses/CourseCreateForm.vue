<script setup lang="ts">
import type { InstructorListItem } from '~/types/instructors/instructor';
import type { OfferedCourseType } from '~/types/schools/drivingSchool';
import type { CourseCreatePayload, CourseKind } from '~/types/courses/course';

const props = defineProps<{
    id?: string;
    schoolId: string;
    /** Kategorie z oferty OSK (`GET /driving-schools` -> `offeredCourseTypes`). */
    offeredCourseTypes: OfferedCourseType[];
    /** Dozwolone rodzaje kursow z ustawien OSK - brak / pusto = pokazuj wszystkie (kompatybilnosc wsteczna). */
    enabledCourseKinds?: CourseKind[];
    isSchoolContextLoading: boolean;
    instructors: InstructorListItem[];
    isInstructorsLoading: boolean;
    isSaving: boolean;
    apiError: string | null;
}>();

const emit = defineEmits<{
    submit: [payload: CourseCreatePayload];
}>();

const {
    capacityModel,
    categoryModel,
    handleSubmit,
    hasOfferedCategoryList,
    instructorIdModel,
    isFormBlocked,
    isTheoryKind,
    kindModel,
    kindOptions,
    nameModel,
    qualifiedInstructors,
    showCapacityInvalid,
    showCategoryRequired,
    showKindRequired,
    showNameRequired,
    showNoEnabledKindsMessage,
    showNoOfferedCategoriesHint,
    showTheoryEndRequired,
    showTheoryRangeInvalid,
    showTheoryStartRequired,
    showTotalHoursInvalid,
    theoryEndModel,
    theoryStartModel,
    totalHoursModel,
} = useCourseCreateForm(props, (payload) => emit('submit', payload));

const isDisabled = computed(() => props.isSaving || isFormBlocked.value);
</script>

<template>
    <form
        :id="props.id"
        class="border-border bg-background overflow-hidden rounded-2xl border shadow-sm"
        novalidate
        @submit.prevent="handleSubmit"
    >
        <div
            class="border-border flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-start sm:justify-between md:px-5"
        >
            <div class="min-w-0">
                <h2 class="text-foreground text-lg font-extrabold">
                    Dodaj kurs
                </h2>
                <p class="text-muted-foreground mt-1 text-sm leading-relaxed">
                    Formularz podzielony na logiczne sekcje, bez zmiany
                    walidacji i flow.
                </p>
            </div>
            <UiBadge
                variant="outline"
                class="w-fit rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700"
            >
                FormSection
            </UiBadge>
        </div>

        <div class="space-y-5 px-4 py-4 md:px-5">
            <p
                v-if="apiError"
                class="text-destructive text-sm"
                role="alert"
                aria-live="polite"
            >
                {{ apiError }}
            </p>

            <p
                v-if="isSchoolContextLoading"
                class="text-muted-foreground text-sm"
                role="status"
            >
                Wczytywanie oferty kategorii i ustawień szkoły…
            </p>

            <p
                v-else-if="showNoOfferedCategoriesHint"
                class="text-muted-foreground text-sm"
                role="status"
            >
                Brak listy kategorii z ustawień OSK w odpowiedzi serwera — wpisz
                kod kategorii ręcznie (np. B). Po skonfigurowaniu oferty w
                panelu szkoły pojawi się lista wyboru.
            </p>

            <p
                v-else-if="showNoEnabledKindsMessage"
                class="text-destructive text-sm"
                role="alert"
                aria-live="polite"
            >
                W ustawieniach tej szkoły nie włączono żadnego rodzaju kursu
                (teoria / praktyka / dodatkowy). Uzupełnij pole „włączone
                rodzaje kursów” w konfiguracji OSK.
            </p>

            <div class="grid gap-4 lg:grid-cols-2">
                <CourseCreateBasicFields
                    v-model:name="nameModel"
                    v-model:category="categoryModel"
                    v-model:kind="kindModel"
                    v-model:total-hours="totalHoursModel"
                    :offered-course-types="props.offeredCourseTypes"
                    :has-offered-category-list="hasOfferedCategoryList"
                    :kind-options="kindOptions"
                    :is-disabled="isDisabled"
                    :show-name-required="showNameRequired"
                    :show-category-required="showCategoryRequired"
                    :show-kind-required="showKindRequired"
                    :show-total-hours-invalid="showTotalHoursInvalid"
                />

                <template v-if="isTheoryKind">
                    <CourseCreateTheoryFields
                        v-model:theory-start="theoryStartModel"
                        v-model:theory-end="theoryEndModel"
                        v-model:capacity="capacityModel"
                        :is-disabled="isDisabled"
                        :show-theory-start-required="showTheoryStartRequired"
                        :show-theory-end-required="showTheoryEndRequired"
                        :show-theory-range-invalid="showTheoryRangeInvalid"
                        :show-capacity-invalid="showCapacityInvalid"
                    />
                </template>

                <CourseCreateInstructorField
                    v-model:instructor-id="instructorIdModel"
                    :instructors="props.instructors"
                    :qualified-instructors="qualifiedInstructors"
                    :is-instructors-loading="props.isInstructorsLoading"
                    :is-disabled="isDisabled"
                />
            </div>

            <div class="space-y-2">
                <UiLabel for="course-create-description">Opis kursu</UiLabel>
                <UiTextarea
                    id="course-create-description"
                    class="bg-background min-h-24 rounded-xl"
                    placeholder="Krótki opis widoczny w panelu..."
                    disabled
                />
            </div>
        </div>

        <CourseCreateFormActions
            :school-id="props.schoolId"
            :is-saving="isSaving"
            :is-blocked="isFormBlocked"
        />
    </form>
</template>
