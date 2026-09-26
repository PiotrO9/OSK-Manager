<script setup lang="ts">
import type { InstructorListItem } from '~/types/instructors/instructor';
import type { OfferedCourseType } from '~/types/schools/drivingSchool';
import type { CourseCreatePayload, CourseKind } from '~/types/courses/course';
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';

const props = defineProps<{
    id?: string;
    schoolId: string;
    /** Kategorie z oferty OSK (`GET /driving-schools` -> `offeredCourseTypes`). */
    offeredCourseTypes: OfferedCourseType[];
    /** Dozwolone rodzaje kursów z ustawień OSK. Pusta lista blokuje zapis. */
    enabledCourseKinds?: CourseKind[];
    isSchoolContextLoading: boolean;
    instructors: InstructorListItem[];
    isInstructorsLoading: boolean;
    instructorsLoadError: string | null;
    isSaving: boolean;
    isCreated: boolean;
    apiError: string | null;
}>();

const emit = defineEmits<{
    submit: [payload: CourseCreatePayload];
    retryInstructors: [];
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
const formElement = useTemplateRef<HTMLFormElement>('formElement');

const hasUnsavedChanges = computed(
    () =>
        !props.isCreated &&
        (nameModel.value.trim() !== '' ||
            totalHoursModel.value !== '30' ||
            capacityModel.value !== '' ||
            theoryStartModel.value !== '' ||
            theoryEndModel.value !== '' ||
            instructorIdModel.value !== '' ||
            (props.offeredCourseTypes[0]?.code ?? '') !== categoryModel.value ||
            (kindOptions.value[0] ?? 'THEORY_GROUP') !== kindModel.value),
);

function confirmLeave() {
    return (
        !hasUnsavedChanges.value ||
        !import.meta.client ||
        window.confirm(
            'Masz niezapisane zmiany. Czy na pewno chcesz opuścić formularz?',
        )
    );
}

onBeforeRouteLeave(confirmLeave);
onBeforeRouteUpdate(confirmLeave);

function handleBeforeUnload(event: BeforeUnloadEvent) {
    if (hasUnsavedChanges.value) {
        event.preventDefault();
        event.returnValue = '';
    }
}

onMounted(() => window.addEventListener('beforeunload', handleBeforeUnload));
onBeforeUnmount(() =>
    window.removeEventListener('beforeunload', handleBeforeUnload),
);

async function submitForm() {
    if (!handleSubmit()) {
        await nextTick();
        const invalid = formElement.value?.querySelector<HTMLElement>(
            '[aria-invalid="true"]',
        );

        invalid?.focus();
    }
}
</script>

<template>
    <form
        :id="props.id"
        ref="formElement"
        class="border-border bg-background overflow-hidden rounded-2xl border shadow-sm"
        novalidate
        @submit.prevent="submitForm"
    >
        <div
            class="border-border flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-start sm:justify-between md:px-5"
        >
            <div class="min-w-0">
                <h2 class="text-foreground text-lg font-bold">Dane kursu</h2>
                <p class="text-muted-foreground mt-1 text-sm leading-relaxed">
                    Podstawowe informacje o nowym kursie.
                </p>
            </div>
        </div>

        <div class="space-y-5 px-4 py-5 md:px-5">
            <p
                v-if="apiError"
                class="text-destructive text-sm"
                role="alert"
                aria-live="polite"
            >
                {{ apiError }}
            </p>

            <p
                v-if="showNoOfferedCategoriesHint"
                class="text-muted-foreground text-sm"
                role="status"
            >
                Brak listy kategorii z ustawień OSK w odpowiedzi serwera — wpisz
                kod kategorii ręcznie (np. B). Po skonfigurowaniu oferty w
                panelu szkoły pojawi się lista wyboru.
            </p>

            <p
                v-if="showNoEnabledKindsMessage"
                class="text-destructive text-sm"
                role="alert"
                aria-live="polite"
            >
                W ustawieniach tej szkoły nie włączono żadnego rodzaju kursu
                (teoria / praktyka / dodatkowy). Uzupełnij pole „włączone
                rodzaje kursów” w konfiguracji OSK.
            </p>

            <div class="grid gap-x-5 gap-y-4 lg:grid-cols-2">
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
            </div>
        </div>

        <section
            v-if="isTheoryKind"
            class="border-border border-t px-4 py-5 md:px-5"
        >
            <h2 class="text-foreground text-base font-semibold">
                Terminy i miejsca
            </h2>
            <p class="text-muted-foreground mt-1 text-sm">
                Ustawienia kursu teoretycznego.
            </p>
            <div class="mt-4 grid gap-x-5 gap-y-4 lg:grid-cols-2">
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
            </div>
        </section>

        <section class="border-border border-t px-4 py-5 md:px-5">
            <h2 class="text-foreground text-base font-semibold">Prowadzący</h2>
            <div class="mt-4 max-w-2xl">
                <CourseCreateInstructorField
                    v-model:instructor-id="instructorIdModel"
                    :instructors="props.instructors"
                    :qualified-instructors="qualifiedInstructors"
                    :is-instructors-loading="props.isInstructorsLoading"
                    :instructors-load-error="props.instructorsLoadError"
                    :is-disabled="isDisabled"
                    @retry="emit('retryInstructors')"
                />
            </div>
        </section>

        <CourseCreateFormActions
            :school-id="props.schoolId"
            :is-saving="isSaving"
            :is-blocked="isFormBlocked"
        />
    </form>
</template>
